const ChatMessage = require('../models/ChatMessage');
const Booking = require('../models/Booking');

// @desc    Get chat messages for a specific booking
// @route   GET /api/bookings/:bookingId/messages
// @access  Public / Private
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const messages = await ChatMessage.find({ booking: bookingId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a chat message or quick-reply chip
// @route   POST /api/bookings/:bookingId/messages
// @access  Private / Public
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text, isQuickReply = false, senderRole = 'customer', senderName } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const senderId = req.user ? req.user.id : (booking.customer || booking._id);

    const message = await ChatMessage.create({
      booking: booking._id,
      sender: senderId,
      senderRole,
      senderName: senderName || (req.user ? req.user.name : (senderRole === 'customer' ? 'Customer' : 'Provider')),
      text,
      isQuickReply,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
