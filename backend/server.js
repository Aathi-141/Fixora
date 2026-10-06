const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/tests', testRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Fixora API',
    tagline: 'Home-Service Booking Platform (Sri Lanka)',
    version: '1.0.0',
    currency: 'LKR',
    status: 'Running',
    endpoints: [
      '/api/auth',
      '/api/providers',
      '/api/bookings',
      '/api/reviews',
      '/api/admin',
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixora_db';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(` MongoDB Connected Successfully: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(` Fixora Backend Server running on port ${PORT}`);
      console.log(` Health check available at: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB Connection Error:', err.message);
    // Still run server so fallback or in-memory routes can be checked
    app.listen(PORT, () => {
      console.log(` Fixora Backend Server running on port ${PORT} (without MongoDB)`);
    });
  });

module.exports = app;
