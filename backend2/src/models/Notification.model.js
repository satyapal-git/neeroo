const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../constants/status.constant');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ adminId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId', 'orderId status');
};

// Static method to get admin notifications
notificationSchema.statics.getAdminNotifications = function (adminId, limit = 50) {
  return this.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('orderId', 'orderId status userMobile');
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function (userId, adminId) {
  const query = { read: false };
  if (userId) query.userId = userId;
  if (adminId) query.adminId = adminId;
  return this.countDocuments(query);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function (userId, adminId) {
  const query = { read: false };
  if (userId) query.userId = userId;
  if (adminId) query.adminId = adminId;
  
  return this.updateMany(query, {
    $set: { read: true, readAt: new Date() },
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;