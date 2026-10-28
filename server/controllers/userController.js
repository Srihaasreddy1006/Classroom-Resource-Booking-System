const User = require('../models/User');
const { logAction } = require('../services/auditService');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/inactive status (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await logAction(
      req.user,
      user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      { targetUser: user.email, isActive: user.isActive },
      req
    );

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus
};
