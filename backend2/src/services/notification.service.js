const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const { NOTIFICATION_TYPE } = require('../constants/status.constant');
const logger = require('../utils/logger.util');
const { sendToUser, sendToAdmin, sendToAllAdmins } = require('../utils/socket.util');
const { sendPushNotification, sendMulticastNotification, isFirebaseInitialized } = require('../utils/firebase.util');

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
 * Send Push to User's Devices
 */
const sendPushToUser = async (userId, title, message, data = {}) => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized, skipping push notification');
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      logger.warn(`No FCM tokens found for user: ${userId}`);
      return;
    }

    const tokens = user.fcmTokens.map(t => t.token);
    const result = await sendMulticastNotification(tokens, title, message, data);
    
    // Remove invalid tokens
    if (result && result.invalidTokens && result.invalidTokens.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: { $in: result.invalidTokens } } }
      });
      logger.info(`Removed ${result.invalidTokens.length} invalid tokens for user ${userId}`);
    }

  } catch (error) {
    logger.error(`Error sending push to user: ${error.message}`);
  }
};

/**
 * Send Push to Admin's Devices
 */
const sendPushToAdmin = async (adminId, title, message, data = {}) => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized, skipping push notification');
    return;
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.fcmTokens || admin.fcmTokens.length === 0) {
      logger.warn(`No FCM tokens found for admin: ${adminId}`);
      return;
    }

    const tokens = admin.fcmTokens.map(t => t.token);
    const result = await sendMulticastNotification(tokens, title, message, data);
    
    // Remove invalid tokens
    if (result && result.invalidTokens && result.invalidTokens.length > 0) {
      await Admin.findByIdAndUpdate(adminId, {
        $pull: { fcmTokens: { token: { $in: result.invalidTokens } } }
      });
      logger.info(`Removed ${result.invalidTokens.length} invalid tokens for admin ${adminId}`);
    }

  } catch (error) {
    logger.error(`Error sending push to admin: ${error.message}`);
  }
};

/**
 * Send Push to All Admins
 */
const sendPushToAllAdmins = async (title, message, data = {}) => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized, skipping push notification');
    return;
  }

  try {
    const admins = await Admin.find({ isActive: true });
    const allTokens = [];
    const adminTokenMap = new Map(); // adminId -> tokens

    admins.forEach(admin => {
      if (admin.fcmTokens && admin.fcmTokens.length > 0) {
        const tokens = admin.fcmTokens.map(t => t.token);
        adminTokenMap.set(admin._id.toString(), tokens);
        allTokens.push(...tokens);
      }
    });

    if (allTokens.length > 0) {
      const result = await sendMulticastNotification(allTokens, title, message, data);
      
      // Remove invalid tokens
      if (result && result.invalidTokens && result.invalidTokens.length > 0) {
        for (const [adminId, tokens] of adminTokenMap.entries()) {
          const invalidTokensForAdmin = tokens.filter(t => result.invalidTokens.includes(t));
          if (invalidTokensForAdmin.length > 0) {
            await Admin.findByIdAndUpdate(adminId, {
              $pull: { fcmTokens: { token: { $in: invalidTokensForAdmin } } }
            });
          }
        }
        logger.info(`Removed ${result.invalidTokens.length} invalid admin tokens`);
      }
    }

  } catch (error) {
    logger.error(`Error sending push to all admins: ${error.message}`);
  }
};

/**
 * Send New Order Notification to Admin
 */
const notifyAdminNewOrder = async (order, adminId) => {
  try {
    const title = 'New Order Received! 🎉';
    const message = `New order #${order.orderId} from ${order.userMobile}. Total: ₹${order.total}`;

    const notification = await createNotification({
      adminId,
      type: NOTIFICATION_TYPE.NEW_ORDER,
      title,
      message,
      orderId: order._id,
    });

    const notificationData = {
      type: 'new_order',
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      notificationId: notification._id.toString(),
    };

    // Send WebSocket notification
    if (adminId) {
      sendToAdmin(adminId.toString(), 'new_notification', {
        notification,
        ...notificationData,
      });
      
      // Send Push Notification
      await sendPushToAdmin(adminId, title, message, notificationData);
    } else {
      sendToAllAdmins('new_notification', {
        notification,
        ...notificationData,
      });
      
      // Send Push to All Admins
      await sendPushToAllAdmins(title, message, notificationData);
    }

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

    const title = `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`;
    const message = statusMessages[order.status] || `Order status updated to ${order.status}`;

    const notification = await createNotification({
      userId: order.userId,
      type: NOTIFICATION_TYPE.ORDER_UPDATE,
      title,
      message,
      orderId: order._id,
    });

    const notificationData = {
      type: 'order_update',
      orderId: order._id.toString(),
      orderNumber: order.orderId,
      status: order.status,
      notificationId: notification._id.toString(),
    };

    // Send WebSocket notification
    sendToUser(order.userId.toString(), 'new_notification', {
      notification,
      ...notificationData,
    });

    // Send Push Notification
    await sendPushToUser(order.userId, title, message, notificationData);

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

    const notificationData = {
      type: 'admin_message',
      notificationId: notification._id.toString(),
    };

    // Send WebSocket notification
    sendToUser(userId.toString(), 'new_notification', {
      notification,
      ...notificationData,
    });

    // Send Push Notification
    await sendPushToUser(userId, title, message, notificationData);

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