const Notification = require('../models/Notification.model');
const { NOTIFICATION_TYPE } = require('../constants/status.constant');
const logger = require('../utils/logger.util');

/**
 * Create Notification
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    logger.info(`Notification created: ${notification._id}`);
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send New Order Notification to Admin
 */
const notifyAdminNewOrder = async (order, adminId) => {
  try {
    const notification = await createNotification({
      adminId,
      type: NOTIFICATION_TYPE.NEW_ORDER,
      title: 'New Order Received! 🎉',
      message: `New order #${order.orderId} from ${order.userMobile}. Total: ₹${order.total}`,
      orderId: order._id,
    });

    logger.info(`Admin notified about new order: ${order.orderId}`);
    return notification;

  } catch (error) {
    logger.error(`Error notifying admin about new order: ${error.message}`);
    // Don't throw error, just log it
  }
};

/**
 * Send Order Status Update Notification to User
 */
const notifyUserOrderUpdate = async (order) => {
  try {
    const statusMessages = {
      pending: 'Your order has been received and is pending preparation.',
      preparing: 'Great news! Your order is being prepared. 👨‍🍳',
      ready: 'Your order is ready! 🎉',
      delivered: 'Your order has been delivered. Enjoy your meal! 😋',
    };

    const notification = await createNotification({
      userId: order.userId,
      type: NOTIFICATION_TYPE.ORDER_UPDATE,
      title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      message: statusMessages[order.status] || `Order status updated to ${order.status}`,
      orderId: order._id,
    });

    logger.info(`User notified about order update: ${order.orderId}`);
    return notification;

  } catch (error) {
    logger.error(`Error notifying user about order update: ${error.message}`);
    // Don't throw error, just log it
  }
};

/**
 * Send Custom Message to User
 */
const sendMessageToUser = async (userId, title, message) => {
  try {
    const notification = await createNotification({
      userId,
      type: NOTIFICATION_TYPE.ADMIN_MESSAGE,
      title,
      message,
    });

    logger.info(`Custom message sent to user: ${userId}`);
    return notification;

  } catch (error) {
    logger.error(`Error sending custom message to user: ${error.message}`);
    throw error;
  }
};

/**
 * Get User Notifications
 */
const getUserNotifications = async (userId, limit = 50) => {
  try {
    return await Notification.getUserNotifications(userId, limit);
  } catch (error) {
    logger.error(`Error fetching user notifications: ${error.message}`);
    throw error;
  }
};

/**
 * Get Admin Notifications
 */
const getAdminNotifications = async (adminId, limit = 50) => {
  try {
    return await Notification.getAdminNotifications(adminId, limit);
  } catch (error) {
    logger.error(`Error fetching admin notifications: ${error.message}`);
    throw error;
  }
};

/**
 * Mark Notification as Read
 */
const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return await notification.markAsRead();
  } catch (error) {
    logger.error(`Error marking notification as read: ${error.message}`);
    throw error;
  }
};

/**
 * Mark All Notifications as Read
 */
const markAllAsRead = async (userId, adminId) => {
  try {
    return await Notification.markAllAsRead(userId, adminId);
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error.message}`);
    throw error;
  }
};

/**
 * Get Unread Count
 */
const getUnreadCount = async (userId, adminId) => {
  try {
    return await Notification.getUnreadCount(userId, adminId);
  } catch (error) {
    logger.error(`Error fetching unread count: ${error.message}`);
    throw error;
  }
};

/**
 * Delete Notification
 */
const deleteNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    logger.info(`Notification deleted: ${notificationId}`);
    return notification;
  } catch (error) {
    logger.error(`Error deleting notification: ${error.message}`);
    throw error;
  }
};

/**
 * Cleanup old notifications (older than 30 days)
 */
const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
    });

    logger.info(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    logger.error(`Error cleaning up old notifications: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createNotification,
  notifyAdminNewOrder,
  notifyUserOrderUpdate,
  sendMessageToUser,
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  cleanupOldNotifications,
};