const Booking = require('../models/Booking');
const Classroom = require('../models/Classroom');
const Resource = require('../models/Resource');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get system-wide dashboard statistics
// @route   GET /api/reports/dashboard-stats
// @access  Private (Admin & Faculty)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalClassrooms = await Classroom.countDocuments();
    const activeClassrooms = await Classroom.countDocuments({ status: 'active' });
    const maintenanceClassrooms = await Classroom.countDocuments({ status: 'maintenance' });

    const totalResources = await Resource.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'Rejected' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });

    // Classroom bookings distribution
    const classroomStats = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$classroom', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'classrooms',
          localField: '_id',
          foreignField: '_id',
          as: 'classroomInfo'
        }
      },
      { $unwind: '$classroomInfo' },
      {
        $project: {
          classroomId: '$classroomInfo.classroomId',
          name: '$classroomInfo.name',
          type: '$classroomInfo.type',
          approvedBookings: '$count'
        }
      }
    ]);

    // Bookings by Classroom Type
    const typeDistribution = await Booking.aggregate([
      {
        $lookup: {
          from: 'classrooms',
          localField: 'classroom',
          foreignField: '_id',
          as: 'classroomInfo'
        }
      },
      { $unwind: '$classroomInfo' },
      {
        $group: {
          _id: '$classroomInfo.type',
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('classroom', 'name classroomId building')
      .populate('user', 'name role department')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        classrooms: {
          total: totalClassrooms,
          active: activeClassrooms,
          maintenance: maintenanceClassrooms
        },
        resources: {
          total: totalResources
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings,
          rejected: rejectedBookings,
          cancelled: cancelledBookings
        },
        users: {
          students: totalStudents,
          faculty: totalFaculty
        },
        topClassrooms: classroomStats,
        typeDistribution,
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/reports/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50, page = 1 } = req.query;

    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate printable/exportable report data
// @route   GET /api/reports/export
// @access  Private (Admin only)
const getExportReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('classroom', 'classroomId name building floor capacity type')
      .populate('user', 'name email role department idNumber')
      .populate('reviewedBy', 'name email')
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      generatedAt: new Date(),
      totalRecords: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs,
  getExportReport
};
