const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { protectAdmin } = require('../middlewares/admin.middleware');
const { validate } = require('../middlewares/validation.middleware');

// Middleware to handle both user and admin auth
const authenticateUserOrAdmin = (req, res, next) => {
  // Try user auth first
  const userToken = req.headers.authorization;
  
  if (userToken) {
    // Use either protect or protectAdmin based on decoded token
    const token = userToken.split(' ')[1];
    const decoded = require('../utils/jwt.util').decodeToken(token);
    
    if (decoded && decoded.role === 'admin') {
      return protectAdmin(req, res, next);
    } else {
      return protect(req, res, next);
    }
  }
  
  return res.status(401).json({
    success: false,
    message: 'Unauthorized access',
  });
};

/**
 * @route   GET /api/notifications
 * @desc    Get notifications (User/Admin)
 * @access  Private
 */
router.get('/', authenticateUserOrAdmin, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread count (User/Admin)
 * @access  Private
 */
router.get('/unread-count', authenticateUserOrAdmin, notificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read (User/Admin)
 * @access  Private
 */
router.patch('/read-all', authenticateUserOrAdmin, notificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read (User/Admin)
 * @access  Private
 */
router.patch('/:id/read', authenticateUserOrAdmin, notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification (User/Admin)
 * @access  Private
 */
router.delete('/:id', authenticateUserOrAdmin, notificationController.deleteNotification);

/**
 * @route   POST /api/notifications/send
 * @desc    Send custom notification to user (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/send',
  protectAdmin,
  [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message cannot exceed 500 characters'),
  ],
  validate,
  notificationController.sendNotification
);

module.exports = router;