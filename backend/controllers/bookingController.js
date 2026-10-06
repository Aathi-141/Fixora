const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is currently disconnected. Please verify database connectivity.',
      });
    }

    const {
      providerId,
      serviceCategory,
      serviceTitle,
      scheduledDate,
      timeSlot,
      serviceAddress,
      customerPhone,
      notes,
      addOns = [],
      pricing,
    } = req.body;

    if (!providerId || !scheduledDate || !timeSlot || !serviceAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide provider, date, time slot, and service address',
      });
    }

    let provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      provider = await ProviderProfile.findOne({ user: providerId });
    }
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Calculate or accept pricing
    const basePrice = pricing?.basePrice || provider.hourlyRate * 3;
    const addOnsTotal =
      pricing?.addOnsTotal ||
      addOns.filter((a) => a.selected).reduce((sum, item) => sum + (item.price || 0), 0);
    const serviceFee = pricing?.serviceFee || 250;
    const totalAmount = pricing?.totalAmount || basePrice + addOnsTotal + serviceFee;

    const booking = await Booking.create({
      customer: req.user ? req.user.id : req.body.customerId,
      provider: provider._id,
      serviceCategory: serviceCategory || provider.category,
      serviceTitle: serviceTitle || `${provider.category} Service`,
      scheduledDate,
      timeSlot,
      serviceAddress,
      customerPhone: customerPhone || (req.user ? req.user.phone : '+94 77 123 4567'),
      notes: notes || '',
      addOns,
      pricing: {
        basePrice,
        addOnsTotal,
        serviceFee,
        discount: 0,
        totalAmount,
      },
      paymentBreakdown: [
        { description: 'Base Inspection & Service', amount: basePrice },
        { description: 'Selected Add-Ons', amount: addOnsTotal },
        { description: 'Platform & Trust Fee', amount: serviceFee },
      ],
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('provider')
      .populate('customer', 'name phone email avatar address');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Public / Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('provider')
      .populate('customer', 'name phone email avatar address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookings (Ongoing and Completed)
// @route   GET /api/bookings/my-history
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    const query = userId ? { customer: userId } : {};

    const bookings = await Booking.find(query)
      .populate('provider')
      .populate('customer', 'name phone email avatar address')
      .sort({ createdAt: -1 });

    const ongoing = bookings.filter((b) =>
      ['pending', 'accepted', 'on_the_way', 'work_in_progress'].includes(b.status)
    );
    const completed = bookings.filter((b) =>
      ['completed', 'cancelled', 'rejected'].includes(b.status)
    );

    return res.status(200).json({
      success: true,
      total: bookings.length,
      ongoingCount: ongoing.length,
      completedCount: completed.length,
      data: {
        all: bookings,
        ongoing,
        completed,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule a booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
  try {
    const { scheduledDate, timeSlot, notes } = req.body;

    if (!scheduledDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both new date and time slot',
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Save previous schedule to history
    booking.rescheduledHistory.push({
      previousDate: booking.scheduledDate,
      previousTimeSlot: booking.timeSlot,
      rescheduledAt: new Date(),
    });

    booking.scheduledDate = scheduledDate;
    booking.timeSlot = timeSlot;
    if (notes !== undefined) {
      booking.notes = notes;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Accept, Reject, On The Way, Completed)
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is currently disconnected. Please verify database connectivity.',
      });
    }

    const { status, etaMinutes, rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (etaMinutes) {
      booking.etaMinutes = etaMinutes;
      const now = new Date();
      now.setMinutes(now.getMinutes() + etaMinutes);
      booking.etaTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (rejectionReason) booking.cancellationReason = rejectionReason;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('provider')
      .populate('customer', 'name phone email avatar address');

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process payment for final bill
// @route   POST /api/bookings/:id/pay
// @access  Private
exports.payBooking = async (req, res) => {
  try {
    const { paymentMethod = 'Credit/Debit Card' } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.isPaid = true;
    booking.paymentMethod = paymentMethod;
    booking.paidAt = new Date();
    booking.transactionId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    booking.status = 'completed';

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
