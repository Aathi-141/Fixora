const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      default: () => 'FX-' + Math.floor(10000 + Math.random() * 90000),
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    serviceAddress: {
      type: String,
      required: true,
      default: 'No 42, New Kandy Road, Malabe',
    },
    customerPhone: {
      type: String,
      default: '+94 77 123 4567',
    },
    notes: {
      type: String,
      default: '',
    },
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        selected: { type: Boolean, default: true },
      },
    ],
    pricing: {
      basePrice: { type: Number, required: true, default: 2500 },
      addOnsTotal: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 250 },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true, default: 2750 },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_the_way', 'work_in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    rescheduledHistory: [
      {
        previousDate: String,
        previousTimeSlot: String,
        rescheduledAt: { type: Date, default: Date.now },
      },
    ],
    etaMinutes: {
      type: Number,
      default: 15,
    },
    etaTime: {
      type: String,
      default: '10:00 AM',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: 'Credit/Debit Card',
    },
    paymentBreakdown: [
      {
        description: String,
        amount: Number,
      },
    ],
    paidAt: {
      type: Date,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
