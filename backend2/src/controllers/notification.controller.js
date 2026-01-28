const notificationService = require('../services/notification.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Get Notifications
 * @route   GET /api/notifications
 * @access  Private (User/Admin)
 */
const getNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    let notifications;

    if (req.userId) {
      // User notifications
      notifications = await notificationService.getUserNotifications(req.userId, limit);
    } else if (req.adminId) {
      // Admin notifications
      notifications = await notificationService.getAdminNotifications(req.adminId, limit);
    } else {
      return errorResponse(res, MESSAGES.ERROR.UNAUTHORIZED, 401);
    }

    return successResponse(res, 'Notifications fetched successfully', {
      notifications,
      count: notifications.length,
    });

  } catch (error) {
    logger.error(`Get Notifications Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Unread Count
 * @route   GET /api/notifications/unread-count
 * @access  Private (User/Admin)
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(
      req.userId || null,
      req.adminId || null
    );

    return successResponse(res, 'Unread count fetched successfully', { count });

  } catch (error) {
    logger.error(`Get Unread Count Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Mark Notification as Read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (User/Admin)
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);

    return successResponse(res, MESSAGES.SUCCESS.NOTIFICATION_READ, {
      notification,
    });

  } catch (error) {
    logger.error(`Mark as Read Error: ${error.message}`);
    
    if (error.message === 'Notification not found') {
      return errorResponse(res, MESSAGES.ERROR.NOTIFICATION_NOT_FOUND, 404);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Mark All Notifications as Read
 * @route   PATCH /api/notifications/read-all
 * @access  Private (User/Admin)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(
      req.userId || null,
      req.adminId || null
    );

    return successResponse(res, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    logger.error(`Mark All as Read Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete Notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (User/Admin)
 */
const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id);

    return successResponse(res, MESSAGES.SUCCESS.NOTIFICATION_DELETED);

  } catch (error) {
    logger.error(`Delete Notification Error: ${error.message}`);
    
    if (error.message === 'Notification not found') {
      return errorResponse(res, MESSAGES.ERROR.NOTIFICATION_NOT_FOUND, 404);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Send Custom Notification to User (Admin)
 * @route   POST /api/notifications/send
 * @access  Private (Admin)
 */
const sendNotification = async (req, res, next) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return errorResponse(res, MESSAGES.ERROR.MISSING_FIELDS, 400);
    }

    const notification = await notificationService.sendMessageToUser(
      userId,
      title,
      message
    );

    logger.info(`Custom notification sent by admin ${req.adminId} to user ${userId}`);

    return successResponse(res, MESSAGES.SUCCESS.NOTIFICATION_SENT, {
      notification,
    });

  } catch (error) {
    logger.error(`Send Notification Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
};