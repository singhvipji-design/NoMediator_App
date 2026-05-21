const { Pool } = require('pg');
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in environment variables');
}

const pool = new Pool({ connectionString: DATABASE_URL });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
