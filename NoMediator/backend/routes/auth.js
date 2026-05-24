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

router.post('/google', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required for Google login.' });
  }

  try {
    let result = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE email = $1', [email.toLowerCase()]);
    let user = result.rows[0];

    if (!user) {
      const mockPassword = Math.random().toString(36).substring(2);
      const hashedPassword = await bcrypt.hash(mockPassword, SALT_ROUNDS);
      const insertResult = await db.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
        [name || email.split('@')[0], email.toLowerCase(), null, hashedPassword, 'Tenant']
      );
      user = insertResult.rows[0];
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login.' });
  }
});

router.post('/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  const isTwilioConfigured = accountSid && authToken && verifyServiceSid && 
                             !accountSid.includes('your_') && 
                             !authToken.includes('your_') && 
                             !verifyServiceSid.includes('your_');

  if (!isTwilioConfigured) {
    console.log(`[Twilio Mock Fallback] Mock OTP "123456" triggered for phone: ${phone}`);
    return res.json({ message: 'OTP sent (Mock mode enabled for local testing).', mockMode: true });
  }

  try {
    const twilio = require('twilio')(accountSid, authToken);
    const verification = await twilio.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' });

    res.json({ message: 'OTP sent successfully via SMS.', sid: verification.sid });
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    res.status(500).json({ message: 'Failed to send OTP. Twilio error: ' + error.message });
  }
});

router.post('/otp/login', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  const isTwilioConfigured = accountSid && authToken && verifyServiceSid && 
                             !accountSid.includes('your_') && 
                             !authToken.includes('your_') && 
                             !verifyServiceSid.includes('your_');

  if (!isTwilioConfigured) {
    if (otp !== '123456') {
      return res.status(401).json({ message: 'Invalid OTP code. Use 123456 for testing.' });
    }
  } else {
    try {
      const twilio = require('twilio')(accountSid, authToken);
      const verificationCheck = await twilio.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: phone, code: otp });

      if (!verificationCheck.valid || verificationCheck.status !== 'approved') {
        return res.status(401).json({ message: 'Invalid or expired OTP code.' });
      }
    } catch (error) {
      console.error('Twilio verification check error:', error);
      return res.status(500).json({ message: 'Twilio verification failed: ' + error.message });
    }
  }

  try {
    let result = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE phone = $1', [phone]);
    let user = result.rows[0];

    if (!user) {
      const mockEmail = `user_${phone.replace(/\D/g, '')}@nomediator.com`;
      const mockName = `User ${phone}`;
      const mockPassword = Math.random().toString(36).substring(2);
      const hashedPassword = await bcrypt.hash(mockPassword, SALT_ROUNDS);
      const insertResult = await db.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, created_at',
        [mockName, mockEmail, phone, hashedPassword, 'Tenant']
      );
      user = insertResult.rows[0];
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ message: 'Server error during OTP login.' });
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

const auth = require('../middleware/auth');
router.put('/profile', auth, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  try {
    const userId = req.user.userId;
    const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), userId]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email is already taken.' });
    }

    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone, role, created_at',
      [name, email.toLowerCase(), phone || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
});

module.exports = router;

