const Booking = require('../models/Booking');
const Classroom = require('../models/Classroom');
const Resource = require('../models/Resource');
const {
  validateTimeRange,
  validateBookingDate,
  checkClassroomConflict,
  findAlternativeClassrooms,
  validateEquipmentAvailability
} = require('../services/bookingService');
const { createNotification, notifyAdmins } = require('../services/notificationService');
const { logAction } = require('../services/auditService');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Student, Faculty, Admin)
const createBooking = async (req, res, next) => {
  try {
    const { classroomId, date, startTime, endTime, purpose, attendees, additionalEquipment } = req.body;

    // 1. Mandatory input presence
    if (!classroomId || !date || !startTime || !endTime || !purpose || !attendees) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: classroomId, date, startTime, endTime, purpose, and attendees.'
      });
    }

    // 2. Validate Date
    const dateVal = validateBookingDate(date);
    if (!dateVal.valid) {
      return res.status(400).json({ success: false, message: dateVal.message });
    }

    // 3. Validate Time Range
    const timeVal = validateTimeRange(startTime, endTime);
    if (!timeVal.valid) {
      return res.status(400).json({ success: false, message: timeVal.message });
    }

    // 4. Validate Classroom Existence and Status
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Specified classroom not found.' });
    }

    if (classroom.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Classroom '${classroom.name}' is currently ${classroom.status} and cannot be booked.`
      });
    }

    // 5. Validate Capacity
    const attendeeCount = Number(attendees);
    if (isNaN(attendeeCount) || attendeeCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Expected attendees must be a positive number greater than 0.'
      });
    }

    if (attendeeCount > classroom.capacity) {
      return res.status(400).json({
        success: false,
        message: `Expected attendees (${attendeeCount}) exceed the seating capacity of ${classroom.name} (${classroom.capacity} seats).`
      });
    }

    // 6. Check for Double-Booking / Time Conflicts
    const conflicts = await checkClassroomConflict(classroom._id, date, startTime, endTime);
    if (conflicts.length > 0) {
      // Suggest alternatives
      const alternatives = await findAlternativeClassrooms(date, startTime, endTime, attendeeCount, classroom._id);
      return res.status(409).json({
        success: false,
        message: `Classroom conflict detected! ${classroom.name} is already booked on ${date} between ${conflicts[0].startTime} and ${conflicts[0].endTime}.`,
        conflictDetails: {
          classroom: classroom.name,
          date,
          conflictingSlots: conflicts.map((c) => ({
            bookingId: c.bookingId,
            time: `${c.startTime} - ${c.endTime}`,
            status: c.status
          }))
        },
        suggestedAlternatives: alternatives.map((a) => ({
          _id: a._id,
          name: a.name,
          building: a.building,
          capacity: a.capacity,
          type: a.type
        }))
      });
    }

    // 7. Validate Equipment Availability
    const eqVal = await validateEquipmentAvailability(additionalEquipment);
    if (!eqVal.valid) {
      return res.status(400).json({ success: false, message: eqVal.message });
    }

    // Decrement portable equipment inventory for booked items
    if (eqVal.resources && eqVal.resources.length > 0) {
      for (const item of eqVal.resources) {
        await Resource.findByIdAndUpdate(item.resource, {
          $inc: { availableQuantity: -item.quantity }
        });
      }
    }

    // 8. Generate Unique Booking ID
    const dateCompact = date.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-${dateCompact}-${randomSuffix}`;

    // 9. Create Booking Record
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      classroom: classroom._id,
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
      attendees: attendeeCount,
      additionalEquipment: eqVal.resources,
      status: 'Pending'
    });

    // 10. In-App Notifications
    await createNotification(
      req.user._id,
      'Booking Request Submitted',
      `Your booking request ${bookingId} for ${classroom.name} on ${date} (${startTime} - ${endTime}) has been received and is pending administrator review.`,
      'booking_created',
      booking._id
    );

    await notifyAdmins(
      'New Booking Request Received',
      `User ${req.user.name} (${req.user.email}) requested ${classroom.name} on ${date} from ${startTime} to ${endTime} for '${purpose.trim()}'.`,
      'booking_created',
      booking._id
    );

    // 11. Audit Log
    await logAction(
      req.user,
      'BOOKING_CREATED',
      {
        bookingId,
        classroom: classroom.name,
        date,
        time: `${startTime}-${endTime}`,
        attendees: attendeeCount
      },
      req
    );

    const populatedBooking = await Booking.findById(booking._id)
      .populate('classroom')
      .populate('user', 'name email role department');

    res.status(201).json({
      success: true,
      message: 'Booking request successfully submitted. An administrator will review your request shortly.',
      data: populatedBooking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's personal bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .populate('classroom')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin/Faculty/Calendar)
// @route   GET /api/bookings
// @access  Private
const getAllBookings = async (req, res, next) => {
  try {
    const { status, date, classroomId, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (date) query.date = date;
    if (classroomId) query.classroom = classroomId;

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('classroom')
      .populate('user', 'name email role department idNumber')
      .populate('reviewedBy', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID or bookingId
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let booking;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id);
    } else {
      booking = await Booking.findOne({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role safety: normal students can only see their own bookings unless admin or faculty
    if (req.user.role === 'student' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this booking record.' });
    }

    await booking.populate('classroom');
    await booking.populate('user', 'name email role department idNumber');
    await booking.populate('reviewedBy', 'name email');

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin approve or reject booking
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin only)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'."
      });
    }

    const booking = await Booking.findById(id).populate('classroom').populate('user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a booking that was already cancelled by the user.'
      });
    }

    // Recheck double booking conflict before approving!
    if (status === 'Approved') {
      const conflicts = await checkClassroomConflict(
        booking.classroom._id,
        booking.date,
        booking.startTime,
        booking.endTime,
        booking._id
      );

      // Only check approved conflicts to avoid blocking self
      const approvedConflicts = conflicts.filter((c) => c.status === 'Approved');
      if (approvedConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Cannot approve: A conflicting approved reservation (${approvedConflicts[0].bookingId}) already exists for ${booking.classroom.name} on ${booking.date} (${approvedConflicts[0].startTime}-${approvedConflicts[0].endTime}).`
        });
      }

      booking.status = 'Approved';
      booking.rejectionReason = null;
      booking.reviewedBy = req.user._id;
      booking.reviewedAt = new Date();

      await booking.save();

      // Notify User
      await createNotification(
        booking.user._id,
        'Booking Approved! 🎉',
        `Congratulations! Your booking (${booking.bookingId}) for ${booking.classroom.name} on ${booking.date} from ${booking.startTime} to ${booking.endTime} has been APPROVED.`,
        'booking_approved',
        booking._id
      );

      await logAction(
        req.user,
        'BOOKING_APPROVED',
        { bookingId: booking.bookingId, classroom: booking.classroom.name, date: booking.date },
        req
      );

      return res.json({
        success: true,
        message: `Booking ${booking.bookingId} has been successfully Approved.`,
        data: booking
      });
    }

    // Status is 'Rejected'
    if (status === 'Rejected') {
      booking.status = 'Rejected';
      booking.rejectionReason = rejectionReason ? rejectionReason.trim() : 'Schedule conflict or administrative discretion';
      booking.reviewedBy = req.user._id;
      booking.reviewedAt = new Date();

      // Release reserved equipment back to inventory
      if (booking.additionalEquipment && booking.additionalEquipment.length > 0) {
        for (const item of booking.additionalEquipment) {
          if (item.resource) {
            await Resource.findByIdAndUpdate(item.resource, {
              $inc: { availableQuantity: item.quantity || 1 }
            });
          }
        }
      }

      await booking.save();

      // Notify User
      await createNotification(
        booking.user._id,
        'Booking Request Rejected',
        `Your booking request (${booking.bookingId}) for ${booking.classroom.name} was rejected. Reason: ${booking.rejectionReason}`,
        'booking_rejected',
        booking._id
      );

      await logAction(
        req.user,
        'BOOKING_REJECTED',
        { bookingId: booking.bookingId, reason: booking.rejectionReason },
        req
      );

      return res.json({
        success: true,
        message: `Booking ${booking.bookingId} has been Rejected.`,
        data: booking
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id).populate('classroom');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization: Owner or Admin
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Past completed bookings cannot be cancelled.' });
    }

    // Release reserved equipment back to inventory
    if (booking.additionalEquipment && booking.additionalEquipment.length > 0) {
      for (const item of booking.additionalEquipment) {
        if (item.resource) {
          await Resource.findByIdAndUpdate(item.resource, {
            $inc: { availableQuantity: item.quantity || 1 }
          });
        }
      }
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = cancellationReason ? cancellationReason.trim() : 'Cancelled by user';
    booking.cancelledAt = new Date();

    await booking.save();

    // In-app notifications
    if (isOwner) {
      await notifyAdmins(
        'Booking Cancelled by User',
        `User ${req.user.name} cancelled reservation ${booking.bookingId} for ${booking.classroom.name} on ${booking.date}.`,
        'booking_cancelled',
        booking._id
      );
    } else {
      await createNotification(
        booking.user,
        'Booking Cancelled by Administrator',
        `Your reservation ${booking.bookingId} for ${booking.classroom.name} on ${booking.date} was cancelled by administrator. Reason: ${booking.cancellationReason}`,
        'booking_cancelled',
        booking._id
      );
    }

    await logAction(
      req.user,
      'BOOKING_CANCELLED',
      { bookingId: booking.bookingId, reason: booking.cancellationReason },
      req
    );

    res.json({
      success: true,
      message: `Booking ${booking.bookingId} has been successfully cancelled and allocated resources released.`,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Quick availability check helper for frontend
// @route   GET /api/bookings/check-availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { classroomId, date, startTime, endTime } = req.query;

    if (!classroomId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classroomId, date, startTime, and endTime query parameters.'
      });
    }

    const conflicts = await checkClassroomConflict(classroomId, date, startTime, endTime);
    const isAvailable = conflicts.length === 0;

    let alternatives = [];
    if (!isAvailable) {
      alternatives = await findAlternativeClassrooms(date, startTime, endTime, 20, classroomId);
    }

    res.json({
      success: true,
      available: isAvailable,
      conflicts: conflicts.map((c) => ({
        bookingId: c.bookingId,
        startTime: c.startTime,
        endTime: c.endTime,
        status: c.status
      })),
      alternatives: alternatives.map((a) => ({
        _id: a._id,
        name: a.name,
        building: a.building,
        capacity: a.capacity,
        type: a.type
      }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  checkAvailability
};
