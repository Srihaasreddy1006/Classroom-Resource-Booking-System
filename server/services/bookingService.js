const Booking = require('../models/Booking');
const Classroom = require('../models/Classroom');
const Resource = require('../models/Resource');

/**
 * Validates that start time is before end time and times are valid 24h format
 */
const validateTimeFormat = (timeStr) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
};

const validateTimeRange = (startTime, endTime) => {
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    return { valid: false, message: 'Time must be in 24-hour HH:MM format (e.g. 09:30, 14:00)' };
  }
  if (startTime >= endTime) {
    return { valid: false, message: 'Start time must be strictly before end time' };
  }

  // Minimum duration 30 minutes
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins - startMins < 30) {
    return { valid: false, message: 'Booking duration must be at least 30 minutes' };
  }

  return { valid: true };
};

/**
 * Validates date is not in the past
 */
const validateBookingDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, message: 'Date must be in YYYY-MM-DD format' };
  }
  const today = new Date().toISOString().split('T')[0];
  if (dateStr < today) {
    return { valid: false, message: 'Booking date cannot be in the past' };
  }
  return { valid: true };
};

/**
 * Checks if a classroom has overlapping bookings (Approved or Pending)
 */
const checkClassroomConflict = async (classroomId, date, startTime, endTime, excludeBookingId = null) => {
  const query = {
    classroom: classroomId,
    date,
    status: { $in: ['Approved', 'Pending'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query).populate('user', 'name email role');
  return conflictingBookings;
};

/**
 * Find alternative active classrooms available for the given slot and capacity
 */
const findAlternativeClassrooms = async (date, startTime, endTime, requiredCapacity = 0, currentRoomId = null) => {
  try {
    const candidateRooms = await Classroom.find({
      status: 'active',
      capacity: { $gte: requiredCapacity },
      ...(currentRoomId ? { _id: { $ne: currentRoomId } } : {})
    }).sort({ capacity: 1 }).limit(5);

    const availableAlternatives = [];
    for (const room of candidateRooms) {
      const conflicts = await checkClassroomConflict(room._id, date, startTime, endTime);
      if (conflicts.length === 0) {
        availableAlternatives.push(room);
      }
    }
    return availableAlternatives;
  } catch (err) {
    console.error('[BookingService] Error finding alternative classrooms:', err.message);
    return [];
  }
};

/**
 * Validates and locks equipment quantities for portable resources
 */
const validateEquipmentAvailability = async (additionalEquipment) => {
  if (!additionalEquipment || !Array.isArray(additionalEquipment) || additionalEquipment.length === 0) {
    return { valid: true, resources: [] };
  }

  const validatedEquipment = [];

  for (const item of additionalEquipment) {
    const resource = await Resource.findById(item.resource);
    if (!resource) {
      return {
        valid: false,
        message: `Requested equipment resource (${item.resource}) does not exist.`
      };
    }

    if (resource.status !== 'available') {
      return {
        valid: false,
        message: `Resource '${resource.name}' is currently under maintenance or unavailable.`
      };
    }

    const requestedQty = Number(item.quantity) || 1;
    if (requestedQty <= 0) {
      return {
        valid: false,
        message: `Requested quantity for '${resource.name}' must be at least 1.`
      };
    }

    if (resource.availableQuantity < requestedQty) {
      return {
        valid: false,
        message: `Insufficient inventory for '${resource.name}'. Requested: ${requestedQty}, Available: ${resource.availableQuantity}.`
      };
    }

    validatedEquipment.push({
      resource: resource._id,
      resourceName: resource.name,
      quantity: requestedQty
    });
  }

  return { valid: true, resources: validatedEquipment };
};

module.exports = {
  validateTimeRange,
  validateBookingDate,
  checkClassroomConflict,
  findAlternativeClassrooms,
  validateEquipmentAvailability
};
