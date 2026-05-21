const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// POST /api/inquiries - Log an owner contact click
router.post('/', auth, async (req, res) => {
  const { propertyId } = req.body;
  if (!propertyId) {
    return res.status(400).json({ message: 'Property ID is required.' });
  }

  try {
    await db.query(
      `INSERT INTO inquiries (user_id, property_id) 
       VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING`,
      [req.user.userId, propertyId]
    );

    res.status(201).json({ success: true, message: 'Inquiry registered.' });
  } catch (error) {
    console.error('Error logging inquiry:', error);
    res.status(500).json({ message: 'Error logging contact request.' });
  }
});

module.exports = router;
