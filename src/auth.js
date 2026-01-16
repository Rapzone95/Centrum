import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const SALT_ROUNDS = 10;

// Hashowanie hasła
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Weryfikacja hasła
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Tworzenie użytkownika
export function createUser(username, password, displayName) {
  return new Promise(async (resolve, reject) => {
    const passwordHash = await hashPassword(password);
    db.run(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
      [username, passwordHash, displayName],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// Logowanie
export function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return reject(err);
      if (!user) return resolve(null);

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) return resolve(null);

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      resolve({ token, user: { id: user.id, username: user.username, displayName: user.display_name } });
    });
  });
}

// Middleware do weryfikacji tokena
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Brak tokena' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Nieprawidłowy token' });
    req.user = user;
    next();
  });
}
