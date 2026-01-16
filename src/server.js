import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pool from './db.js';
import { createUser, loginUser, authenticateToken, validatePassword } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// === RATE LIMITING ===

// Ogólny limit - max 100 żądań na 15 minut
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Zbyt wiele żądań. Spróbuj ponownie później.' }
});

// Strict limit dla logowania - max 5 prób na minutę
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Zbyt wielu prób logowania. Spróbuj ponownie za minutę.' },
  skipSuccessfulRequests: true
});

// Limit dla rejestracji - max 3 na godzinę
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Zbyt many prób rejestracji. Spróbuj ponownie później.' }
});

app.use('/api/', generalLimiter);

// === AUTH ===

app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    // Walidacja
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Nazwa użytkownika: 3-20 znaków' });
    }

    // Walidacja siły hasła
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
