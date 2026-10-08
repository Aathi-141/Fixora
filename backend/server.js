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

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://fixora_admin:fixora2026@cluster0.7ugiyyl.mongodb.net/fixora?retryWrites=true&w=majority';

let cachedConnection = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
  }
  try {
    await cachedConnection;
    return mongoose.connection;
  } catch (error) {
    cachedConnection = null;
    throw error;
  }
}

// Ensure DB is connected before processing any API route
app.use(async (req, res, next) => {
  if (req.path === '/') return next();
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed: ' + err.message,
    });
  }
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Fixora API',
    tagline: 'Home-Service Booking Platform (Sri Lanka)',
    version: '1.0.0',
    currency: 'LKR',
    status: 'Running',
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
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

// Start local server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectToDatabase()
    .then(() => {
      console.log(` MongoDB Connected Successfully: ${MONGODB_URI}`);
      app.listen(PORT, () => {
        console.log(` Fixora Backend Server running on port ${PORT}`);
        console.log(` Health check available at: http://localhost:${PORT}/`);
      });
    })
    .catch((err) => {
      console.error(' MongoDB Connection Error:', err.message);
      app.listen(PORT, () => {
        console.log(` Fixora Backend Server running on port ${PORT} (without MongoDB)`);
      });
    });
}

module.exports = app;
