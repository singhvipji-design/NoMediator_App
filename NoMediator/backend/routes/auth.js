const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
      [name, email.toLowerCase(), phone || null, hashedPassword, 'Tenant']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error while registering.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT id, name, email, phone, password, role, created_at FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password;

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [payload.userId]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

module.exports = router;
