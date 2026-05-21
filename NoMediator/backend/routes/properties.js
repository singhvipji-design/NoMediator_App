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
    rating: 4.2, // Mocked for display
    reviews: 15,  // Mocked for display
    createdAt: row.created_at
  };
}

// GET /api/properties - Retrieve all listings (with filters)
router.get('/', async (req, res) => {
  const { city, type, search, bhk, maxPrice, furnished } = req.query;
  
  let queryText = `
    SELECT p.*, u.name as owner_name, u.phone as owner_phone
    FROM properties p
    JOIN users u ON p.owner_id = u.id
    WHERE 1=1
  `;
  const queryParams = [];
  let paramCount = 1;

  if (city) {
    queryText += ` AND p.city = $${paramCount}`;
    queryParams.push(city);
    paramCount++;
  }

  if (type) {
    queryText += ` AND p.type = $${paramCount}`;
    queryParams.push(type);
    paramCount++;
  }

  if (bhk) {
    queryText += ` AND p.bhk = $${paramCount}`;
    queryParams.push(bhk);
    paramCount++;
  }

  if (maxPrice) {
    queryText += ` AND p.price <= $${paramCount}`;
    queryParams.push(Number(maxPrice));
    paramCount++;
  }

  if (furnished) {
    queryText += ` AND p.furnished = $${paramCount}`;
    queryParams.push(furnished);
    paramCount++;
  }

  if (search) {
    queryText += ` AND (p.title ILIKE $${paramCount} OR p.location ILIKE $${paramCount} OR p.area ILIKE $${paramCount})`;
    queryParams.push(`%${search}%`);
    paramCount++;
  }

  queryText += ' ORDER BY p.created_at DESC';

  try {
    const result = await db.query(queryText, queryParams);
    const properties = result.rows.map(mapPropertyToCamelCase);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

// GET /api/properties/my-listings - Retrieve listings owned by the current user
router.get('/my-listings', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone 
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.owner_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    );
    const properties = result.rows.map(mapPropertyToCamelCase);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching my listings:', error);
    res.status(500).json({ message: 'Error fetching your listings' });
  }
});

// GET /api/properties/:id - Retrieve single property details
router.get('/:id', async (req, res) => {
  const propertyId = Number(req.params.id);
  if (isNaN(propertyId)) {
    return res.status(400).json({ message: 'Invalid property ID' });
  }

  try {
    const result = await db.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone 
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [propertyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(mapPropertyToCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ message: 'Error fetching property details' });
  }
});

// POST /api/properties - Create a new property listing
router.post('/', auth, async (req, res) => {
  const {
    title, location, area, city, price, deposit, bhk, sqft, beds, baths, type, furnished,
    parking, petFriendly, gym, lift, security, colorStart, colorEnd, tag, available
  } = req.body;

  if (!title || !location || !area || !city || !price || !deposit || !bhk || !sqft || !type) {
    return res.status(400).json({ message: 'Missing required property details.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO properties (
        owner_id, title, location, area, city, price, deposit, bhk, sqft, beds, baths, type, furnished, 
        parking, pet_friendly, gym, lift, security, color_start, color_end, tag, available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        req.user.userId,
        title,
        location,
        area,
        city,
        Number(price),
        Number(deposit),
        bhk,
        Number(sqft),
        Number(beds || 1),
        Number(baths || 1),
        type,
        furnished || 'Unfurnished',
        parking || false,
        petFriendly || false,
        gym || false,
        lift || false,
        security || false,
        colorStart || '#E8121A',
        colorEnd || '#FF6F00',
        tag || 'Zero Brokerage',
        available || 'Immediate'
      ]
    );

    // Fetch the inserted property with owner name/phone
    const propertyResult = await db.query(
      `SELECT p.*, u.name as owner_name, u.phone as owner_phone
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(mapPropertyToCamelCase(propertyResult.rows[0]));
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error listing property.' });
  }
});

module.exports = router;
