import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import { createUser, loginUser, authenticateToken } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// === ENDPOINTY AUTH ===

// Rejestracja (użyj raz, żeby stworzyć konta)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    const userId = await createUser(username, password, displayName);
    res.json({ success: true, userId });
  } catch (err) {
    res.status(400).json({ error: 'Użytkownik już istnieje lub błąd' });
  }
});

// Logowanie
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    if (!result) return res.status(401).json({ error: 'Złe dane logowania' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === ENDPOINTY ZADAŃ (chronione) ===

// Pobierz zadania (tylko swoje + udostępnione)
app.get('/api/tasks', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE user_id = ? OR shared = 1 ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Dodaj zadanie
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, shared } = req.body;
  db.run(
    'INSERT INTO tasks (user_id, title, shared) VALUES (?, ?, ?)',
    [req.user.id, title, shared || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, completed: false, shared: shared || 0 });
    }
  );
});

// Oznacz jako wykonane
app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
  const { completed } = req.body;
  db.run(
    'UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?',
    [completed ? 1 : 0, req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Usuń zadanie
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM tasks WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
