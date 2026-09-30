const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookingById,
  getMyBookings,
  rescheduleBooking,
  cancelBooking,
  updateBookingStatus,
  payBooking,
} = require('../controllers/bookingController');
const { getMessages, sendMessage } = require('../controllers/chatController');

// Booking routes
router.post('/', createBooking);
router.get('/my-history', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/reschedule', rescheduleBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/pay', payBooking);

// Chat messages nested under booking
router.get('/:bookingId/messages', getMessages);
router.post('/:bookingId/messages', sendMessage);

module.exports = router;
