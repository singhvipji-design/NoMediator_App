require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migration...');
    // Add columns images TEXT[], videos TEXT[], contact_email TEXT, and contact_phone TEXT
    await client.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS contact_email TEXT,
      ADD COLUMN IF NOT EXISTS contact_phone TEXT;
    `);

    // Create service_bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        city TEXT NOT NULL,
        service_name TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
