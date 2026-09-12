import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, verifyToken } from '../middleware/auth.js';

const router = Router();

function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    title: row.title,
    badgeId: row.badge_id,
    avatarUrl: row.avatar_url,
    lastLogin: row.last_login,
  };
}

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const valid = bcrypt.compareSync(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(row.id);

  const user = toPublicUser(row);
  const token = signToken(user);

  res.json({ success: true, message: 'Login successful', token, user });
});

// GET /api/auth/me  (requires Bearer token)
router.get('/me', verifyToken, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: toPublicUser(row) });
});

// POST /api/auth/logout - stateless JWT, so this is just a client-side hint endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

export default router;
