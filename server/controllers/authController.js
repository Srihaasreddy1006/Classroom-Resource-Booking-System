const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAction } = require('../services/auditService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'crbs_jwt_secret_college_ia3_super_secure_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, idNumber, phoneNumber } = req.body;

    if (!name || !email || !password || !department || !idNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, email, password, department, and ID number.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Role safety: Regular user, student, faculty, and staff can be registered openly; admin accounts are created via setup command
    const safeRole = role && ['student', 'faculty', 'staff', 'user'].includes(role) ? role : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
      department: department.trim(),
      idNumber: idNumber.trim(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : ''
    });

    const token = generateToken(user._id);

    await logAction(user, 'USER_REGISTERED', { email: user.email, role: user.role }, req);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        idNumber: user.idNumber,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: No account found with that email.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Incorrect password entered.'
      });
    }

    const token = generateToken(user._id);

    await logAction(user, 'USER_LOGIN', { email: user.email, role: user.role }, req);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        idNumber: user.idNumber,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, phoneNumber, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (department) user.department = department.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.'
        });
      }
      user.password = password;
    }

    await user.save();

    await logAction(user, 'PROFILE_UPDATED', { email: user.email }, req);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
