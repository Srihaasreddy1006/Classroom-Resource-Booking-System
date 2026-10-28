const Classroom = require('../models/Classroom');
const Booking = require('../models/Booking');
const { logAction } = require('../services/auditService');

// @desc    Get all classrooms with filtering & search
// @route   GET /api/classrooms
// @access  Public (or Authenticated)
const getAllClassrooms = async (req, res, next) => {
  try {
    const { building, floor, type, status, minCapacity, search } = req.query;

    const query = {};

    if (building) query.building = building;
    if (floor) query.floor = floor;
    if (type) query.type = type;
    if (status) query.status = status;
    if (minCapacity) query.capacity = { $gte: Number(minCapacity) };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { classroomId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } }
      ];
    }

    const classrooms = await Classroom.find(query)
      .populate('installedEquipment')
      .sort({ classroomId: 1 });

    res.json({
      success: true,
      count: classrooms.length,
      data: classrooms
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single classroom by ID or classroomId
// @route   GET /api/classrooms/:id
// @access  Public
const getClassroomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let classroom;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      classroom = await Classroom.findById(id).populate('installedEquipment');
    } else {
      classroom = await Classroom.findOne({ classroomId: id.toUpperCase() }).populate('installedEquipment');
    }

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: `Classroom not found with identifier '${id}'.`
      });
    }

    res.json({
      success: true,
      data: classroom
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get classroom availability / schedule for a specific date
// @route   GET /api/classrooms/:id/schedule
// @access  Public
const getClassroomSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date query parameter (YYYY-MM-DD).'
      });
    }

    let classroom;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      classroom = await Classroom.findById(id);
    } else {
      classroom = await Classroom.findOne({ classroomId: id.toUpperCase() });
    }

    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const bookings = await Booking.find({
      classroom: classroom._id,
      date,
      status: { $in: ['Approved', 'Pending'] }
    })
      .select('bookingId startTime endTime purpose status user')
      .populate('user', 'name role department');

    res.json({
      success: true,
      classroom: {
        id: classroom._id,
        classroomId: classroom.classroomId,
        name: classroom.name,
        capacity: classroom.capacity,
        type: classroom.type,
        status: classroom.status
      },
      date,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new classroom
// @route   POST /api/classrooms
// @access  Private (Admin only)
const createClassroom = async (req, res, next) => {
  try {
    const { classroomId, name, building, floor, capacity, type, description, facilities, status, imageUrl } = req.body;

    if (!classroomId || !name || !building || !floor || !capacity || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: classroomId, name, building, floor, capacity, type, and description.'
      });
    }

    const existing = await Classroom.findOne({ classroomId: classroomId.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Classroom ID '${classroomId}' already exists.`
      });
    }

    const classroom = await Classroom.create({
      classroomId: classroomId.toUpperCase().trim(),
      name: name.trim(),
      building: building.trim(),
      floor: floor.trim(),
      capacity: Number(capacity),
      type,
      description: description.trim(),
      facilities: Array.isArray(facilities) ? facilities : facilities ? facilities.split(',').map((f) => f.trim()) : [],
      status: status || 'active',
      imageUrl: imageUrl || ''
    });

    await logAction(req.user, 'CLASSROOM_CREATED', { classroomId: classroom.classroomId, name: classroom.name }, req);

    res.status(201).json({
      success: true,
      message: 'Classroom successfully created.',
      data: classroom
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (Admin only)
const updateClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    const allowedUpdates = [
      'name',
      'building',
      'floor',
      'capacity',
      'type',
      'description',
      'facilities',
      'status',
      'imageUrl'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'facilities' && typeof req.body[field] === 'string') {
          classroom[field] = req.body[field].split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          classroom[field] = req.body[field];
        }
      }
    });

    await classroom.save();

    await logAction(req.user, 'CLASSROOM_UPDATED', { classroomId: classroom.classroomId, updates: req.body }, req);

    res.json({
      success: true,
      message: 'Classroom updated successfully.',
      data: classroom
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or deactivate classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Admin only)
const deleteClassroom = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found.' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      classroom: classroom._id,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (activeBookings > 0) {
      classroom.status = 'inactive';
      await classroom.save();
      return res.json({
        success: true,
        message: `Classroom has ${activeBookings} pending/approved bookings. It has been deactivated instead of permanently deleted to preserve records.`
      });
    }

    await Classroom.findByIdAndDelete(id);

    await logAction(req.user, 'CLASSROOM_DELETED', { classroomId: classroom.classroomId }, req);

    res.json({
      success: true,
      message: 'Classroom successfully deleted.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClassrooms,
  getClassroomById,
  getClassroomSchedule,
  createClassroom,
  updateClassroom,
  deleteClassroom
};
