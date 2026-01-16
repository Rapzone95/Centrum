import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const SALT_ROUNDS = 12; // Zwiększone bezpieczeństwo

// Walidacja siły hasła
export function validatePassword(password) {
  if (password.length < 10) {
    return { valid: false, message: 'Hasło musi mieć minimum 10 znaków' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Hasło musi zawierać dużą literę' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Hasło musi zawierać małą literę' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Hasło musi zawierać cyfrę' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Hasło musi zawierać znak specjalny (!@#$%...)' };
  }
  return { valid: true };
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function createUser(username, password, displayName) {
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    'INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id',
    [username, passwordHash, displayName]
  );
  return result.rows[0].id;
}

export async function loginUser(username, password) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );

  const user = result.rows[0];
  if (!user) return null;

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name
    }
  };
}

export async function changePassword(userId, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );
}

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
