const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/visits - Get user visits
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.id, v.visit_date, v.visit_time, v.status, v.created_at, 
              p.id as property_id, p.title as property_title, p.location as property_location,
              p.price as property_price, p.bhk as property_bhk,
              u.name as owner_name, u.phone as owner_phone
       FROM visits v
       JOIN properties p ON v.property_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE v.user_id = $1
       ORDER BY v.visit_date ASC, v.visit_time ASC`,
      [req.user.userId]
    );

    const visits = result.rows.map(row => ({
      id: String(row.id),
      visitDate: row.visit_date,
      visitTime: row.visit_time,
      status: row.status,
      createdAt: row.created_at,
      property: {
        id: String(row.property_id),
        title: row.property_title,
        location: row.property_location,
        price: Number(row.property_price),
        bhk: row.property_bhk,
        ownerName: row.owner_name,
        ownerPhone: row.owner_phone
      }
    }));

    res.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ message: 'Error fetching visits.' });
  }
});

// POST /api/visits - Schedule a visit
router.post('/', auth, async (req, res) => {
  const { propertyId, visitDate, visitTime } = req.body;
  if (!propertyId || !visitDate || !visitTime) {
    return res.status(400).json({ message: 'Property ID, date, and time are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO visits (user_id, property_id, visit_date, visit_time)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, property_id, visit_date, visit_time, status, created_at`,
      [req.user.userId, propertyId, visitDate, visitTime]
    );

    const visit = result.rows[0];
    res.status(201).json({
      id: String(visit.id),
      userId: visit.user_id,
      propertyId: visit.property_id,
      visitDate: visit.visit_date,
      visitTime: visit.visit_time,
      status: visit.status,
      createdAt: visit.created_at
    });
  } catch (error) {
    console.error('Error scheduling visit:', error);
    res.status(500).json({ message: 'Error scheduling visit.' });
  }
});

module.exports = router;
