require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const favoriteRoutes = require('./routes/favorites');
const visitRoutes = require('./routes/visits');
const inquiryRoutes = require('./routes/inquiries');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL successfully');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message || error);
  }
});

