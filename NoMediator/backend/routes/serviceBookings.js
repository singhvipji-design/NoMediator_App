const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/service-bookings - Get user's service bookings
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, city, service_name, plan_name, price, booking_date, booking_time, status, created_at
       FROM service_bookings
       WHERE user_id = $1
       ORDER BY booking_date DESC, booking_time DESC`,
      [req.user.userId]
    );

    const bookings = result.rows.map(row => ({
      id: String(row.id),
      city: row.city,
      serviceName: row.service_name,
      planName: row.plan_name,
      price: Number(row.price),
      bookingDate: row.booking_date,
      bookingTime: row.booking_time,
      status: row.status,
      createdAt: row.created_at
    }));

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    res.status(500).json({ message: 'Error fetching service bookings.' });
  }
});

// POST /api/service-bookings - Book a new service
router.post('/', auth, async (req, res) => {
  const { city, serviceName, planName, price, bookingDate, bookingTime } = req.body;
  
  if (!city || !serviceName || !planName || !price || !bookingDate || !bookingTime) {
    return res.status(400).json({ message: 'All booking fields (city, serviceName, planName, price, bookingDate, bookingTime) are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO service_bookings (user_id, city, service_name, plan_name, price, booking_date, booking_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, city, service_name, plan_name, price, booking_date, booking_time, status, created_at`,
      [req.user.userId, city, serviceName, planName, price, bookingDate, bookingTime]
    );

    const booking = result.rows[0];
    res.status(201).json({
      id: String(booking.id),
      userId: booking.user_id,
      city: booking.city,
      serviceName: booking.service_name,
      planName: booking.plan_name,
      price: Number(booking.price),
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      status: booking.status,
      createdAt: booking.created_at
    });
  } catch (error) {
    console.error('Error creating service booking:', error);
    res.status(500).json({ message: 'Error creating service booking.' });
  }
});

module.exports = router;
