const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Helper to convert snake_case to camelCase
function mapPropertyToCamelCase(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    ownerId: row.owner_id,
    title: row.title,
    location: row.location,
    area: row.area,
    city: row.city,
    price: Number(row.price),
    deposit: Number(row.deposit),
    bhk: row.bhk,
    sqft: row.sqft,
    beds: row.beds,
    baths: row.baths,
    type: row.type,
    furnished: row.furnished,
    parking: !!row.parking,
    petFriendly: !!row.pet_friendly,
    gym: !!row.gym,
    lift: !!row.lift,
    security: !!row.security,
    colorStart: row.color_start,
    colorEnd: row.color_end,
    tag: row.tag,
    available: row.available,
    ownerName: row.owner_name || null,
    ownerPhone: row.owner_phone || null,
    rating: 4.2,
    reviews: 15,
    createdAt: row.created_at
  };
}

// GET /api/favorites - Retrieve all properties favorited by current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );
    const properties = result.rows.map(mapPropertyToCamelCase);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// POST /api/favorites - Toggle favorite status
router.post('/', auth, async (req, res) => {
  const { propertyId } = req.body;
  if (!propertyId) {
    return res.status(400).json({ message: 'Property ID is required.' });
  }

  try {
    // Check if already favorited
    const existing = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [req.user.userId, propertyId]
    );

    if (existing.rows.length > 0) {
      // Remove it
      await db.query(
        'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
        [req.user.userId, propertyId]
      );
      res.json({ isFavorite: false, message: 'Removed from saved properties.' });
    } else {
      // Add it
      await db.query(
        'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)',
        [req.user.userId, propertyId]
      );
      res.json({ isFavorite: true, message: 'Saved to properties.' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error updating favorite status.' });
  }
});

module.exports = router;
