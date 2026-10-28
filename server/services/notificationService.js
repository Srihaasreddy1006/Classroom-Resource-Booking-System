const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (userId, title, message, type = 'system', bookingId = null) => {
  try {
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      booking: bookingId
    });
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
  }
};

const notifyAdmins = async (title, message, type = 'system', bookingId = null) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title,
      message,
      type,
      booking: bookingId
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[NotificationService] Failed to notify admins:', error.message);
  }
};

module.exports = { createNotification, notifyAdmins };
