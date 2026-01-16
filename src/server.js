import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pool from './db.js';
import { createUser, loginUser, authenticateToken, validatePassword, changePassword } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy dla Render (rate-limit)
app.set('trust proxy', 1);

// CORS - tylko produkcja + localhost dla dev
const allowedOrigins = [
  'https://centrum-6nxr.onrender.com',
  'http://localhost:3000',
  'http://localhost:3003'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // pozwalaj na bez-origin (mobile, postman)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  }
}));

// Helmet - nagłówki bezpieczeństwa
app.use(helmet({
  contentSecurityPolicy: false, // wyłączony dla inline skryptów w dev
  hsts: false // wyłączony na localhost
}));

// Limit rozmiaru body - przeciwko atakom na pamięć
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// === RATE LIMITING ===

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Zbyt wiele żądań. Spróbuj ponownie później.' }
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Zbyt wielu prób logowania. Spróbuj ponownie za minutę.' },
  skipSuccessfulRequests: true
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Zbyt wiele prób rejestracji. Spróbuj ponownie później.' }
});

app.use('/api/', generalLimiter);

// === AUTH ===

app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Nazwa użytkownika: 3-20 znaków' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    const userId = await createUser(username, password, displayName);
    res.json({ success: true, userId });
  } catch (err) {
    res.status(400).json({ error: 'Użytkownik już istnieje lub błąd: ' + err.message });
  }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    const result = await loginUser(username, password);
    if (!result) return res.status(401).json({ error: 'Złe dane logowania' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Zmiana hasła (wymaga stare hasło)
app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Oba hasła są wymagane' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const bcrypt = await import('bcrypt');
    const valid = await bcrypt.default.compare(oldPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Stare hasło jest nieprawidłowe' });
    }

    await changePassword(req.user.id, newPassword);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset hasła (dla odzyskania dostępu - wymaga secret key)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { username, secretKey, newPassword } = req.body;

    // Secret key z .env - tylko właściciel zna go
    if (secretKey !== process.env.RESET_SECRET || !process.env.RESET_SECRET) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Brak danych' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje' });
    }

    await changePassword(result.rows[0].id, newPassword);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === TASKS ===

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 OR shared = TRUE ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, shared } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Tytuł jest wymagany' });
    }

    if (title.length > 500) {
      return res.status(400).json({ error: 'Tytuł max 500 znaków' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, shared) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title.trim(), shared || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.body;
    await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3',
      [completed, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
