const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkAvailability
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Quick check availability
router.get('/check-availability', checkAvailability);

// User personal bookings
router.get('/my-bookings', protect, getMyBookings);

// General bookings listing (Admin & Faculty or user's bookings)
router.get('/', protect, getAllBookings);
router.post('/', protect, createBooking);

router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin approval/rejection endpoint
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
