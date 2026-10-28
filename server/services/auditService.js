const AuditLog = require('../models/AuditLog');

const logAction = async (user, action, details = {}, req = null) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
      : '127.0.0.1';

    await AuditLog.create({
      user: user?._id || null,
      userEmail: user?.email || 'system',
      userRole: user?.role || 'system',
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error.message);
  }
};

module.exports = { logAction };
