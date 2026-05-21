require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const SALT_ROUNDS = 10;

const owners = [
  { name: 'Suresh Kumar', email: 'suresh@nomediator.com', phone: '+91 98765 43210', password: 'password123', role: 'Owner' },
  { name: 'Priya Sharma', email: 'priya@nomediator.com', phone: '+91 87654 32109', password: 'password123', role: 'Owner' },
  { name: 'Ramesh Nair', email: 'ramesh@nomediator.com', phone: '+91 76543 21098', password: 'password123', role: 'Owner' },
  { name: 'Kavitha Reddy', email: 'kavitha@nomediator.com', phone: '+91 65432 10987', password: 'password123', role: 'Owner' },
  { name: 'Anil Mehta', email: 'anil@nomediator.com', phone: '+91 54321 09876', password: 'password123', role: 'Owner' },
  { name: 'Test Tenant', email: 'tenant@nomediator.com', phone: '+91 99999 88888', password: 'password123', role: 'Tenant' }
];

const properties = [
  {
    ownerEmail: 'suresh@nomediator.com',
    title: '3 BHK Apartment in Koramangala',
    location: 'Koramangala, Bengaluru',
    area: 'Koramangala',
    city: 'Bengaluru',
    price: 35000,
    deposit: 210000,
    bhk: '3 BHK',
    sqft: 1450,
    beds: 3,
    baths: 2,
    type: 'Full House',
    furnished: 'Semi-furnished',
    parking: true,
    pet_friendly: false,
    gym: true,
    lift: true,
    security: true,
    color_start: '#E8121A',
    color_end: '#FF6F00',
    tag: 'Zero Brokerage',
    available: 'Immediate'
  },
  {
    ownerEmail: 'priya@nomediator.com',
    title: '2 BHK Flat in Indiranagar',
    location: 'Indiranagar, Bengaluru',
    area: 'Indiranagar',
    city: 'Bengaluru',
    price: 28000,
    deposit: 168000,
    bhk: '2 BHK',
    sqft: 1100,
    beds: 2,
    baths: 2,
    type: 'Full House',
    furnished: 'Furnished',
    parking: true,
    pet_friendly: true,
    gym: false,
    lift: true,
    security: true,
    color_start: '#1565C0',
    color_end: '#00897B',
    tag: 'Pet Friendly',
    available: 'Immediate'
  },
  {
    ownerEmail: 'ramesh@nomediator.com',
    title: '1 BHK in HSR Layout',
    location: 'HSR Layout, Bengaluru',
    area: 'HSR Layout',
    city: 'Bengaluru',
    price: 16000,
    deposit: 96000,
    bhk: '1 BHK',
    sqft: 620,
    beds: 1,
    baths: 1,
    type: 'Full House',
    furnished: 'Unfurnished',
    parking: false,
    pet_friendly: false,
    gym: false,
    lift: false,
    security: true,
    color_start: '#6A1B9A',
    color_end: '#E8121A',
    tag: 'New Listing',
    available: '15 Days'
  },
  {
    ownerEmail: 'kavitha@nomediator.com',
    title: 'PG for Boys in Whitefield',
    location: 'Whitefield, Bengaluru',
    area: 'Whitefield',
    city: 'Bengaluru',
    price: 8000,
    deposit: 16000,
    bhk: 'PG',
    sqft: 200,
    beds: 1,
    baths: 1,
    type: 'PG/Hostel',
    furnished: 'Furnished',
    parking: false,
    pet_friendly: false,
    gym: false,
    lift: false,
    security: true,
    color_start: '#2E7D32',
    color_end: '#1565C0',
    tag: 'Meals Included',
    available: 'Immediate'
  },
  {
    ownerEmail: 'anil@nomediator.com',
    title: '4 BHK Villa in JP Nagar',
    location: 'JP Nagar, Bengaluru',
    area: 'JP Nagar',
    city: 'Bengaluru',
    price: 75000,
    deposit: 450000,
    bhk: '4 BHK',
    sqft: 2800,
    beds: 4,
    baths: 3,
    type: 'Full House',
    furnished: 'Furnished',
    parking: true,
    pet_friendly: true,
    gym: true,
    lift: false,
    security: true,
    color_start: '#FF6F00',
    color_end: '#E8121A',
    tag: 'Premium',
    available: '30 Days'
  }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data (in case script is run multiple times)
    await client.query('TRUNCATE TABLE inquiries, visits, favorites, properties, users RESTART IDENTITY CASCADE;');

    console.log('Seeding users...');
    const emailToIdMap = {};

    for (const owner of owners) {
      const hashedPassword = await bcrypt.hash(owner.password, SALT_ROUNDS);
      const res = await client.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [owner.name, owner.email.toLowerCase(), owner.phone, hashedPassword, owner.role]
      );
      emailToIdMap[owner.email.toLowerCase()] = res.rows[0].id;
    }

    console.log('Seeding properties...');
    for (const prop of properties) {
      const ownerId = emailToIdMap[prop.ownerEmail.toLowerCase()];
      await client.query(
        `INSERT INTO properties (
          owner_id, title, location, area, city, price, deposit, bhk, sqft, beds, baths, type, furnished, 
          parking, pet_friendly, gym, lift, security, color_start, color_end, tag, available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          ownerId, prop.title, prop.location, prop.area, prop.city, prop.price, prop.deposit, prop.bhk, prop.sqft,
          prop.beds, prop.baths, prop.type, prop.furnished, prop.parking, prop.pet_friendly, prop.gym, prop.lift,
          prop.security, prop.color_start, prop.color_end, prop.tag, prop.available
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
