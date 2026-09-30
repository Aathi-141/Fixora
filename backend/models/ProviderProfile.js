const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Electrician', 'Plumber', 'Cleaner', 'HVAC & AC', 'Carpentry', 'Painting'],
    },
    specialization: {
      type: String,
      default: 'General Specialist',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    hourlyRate: {
      type: Number,
      required: true,
      default: 700, // in LKR
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 124,
    },
    onTimeRate: {
      type: Number,
      default: 99.4, // percentage
    },
    jobsCompleted: {
      type: Number,
      default: 840,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    weeklySchedule: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    workingHours: {
      start: { type: String, default: '08:00 AM' },
      end: { type: String, default: '06:00 PM' },
    },
    serviceRadiusKm: {
      type: Number,
      default: 15,
    },
    city: {
      type: String,
      default: 'Colombo',
    },
    about: {
      type: String,
      default: 'Certified home service professional with extensive on-site experience providing guaranteed, dependable solutions.',
    },
    skills: {
      type: [String],
      default: ['General Repairs', 'Diagnostic Testing', 'Installation'],
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'verified',
    },
    licenseNumber: {
      type: String,
      default: 'LK-VER-98432',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
