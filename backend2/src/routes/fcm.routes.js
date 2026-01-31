const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const fcmController = require('../controllers/fcm.controller');
const { protect } = require('../middlewares/auth.middleware');
const { protectAdmin } = require('../middlewares/admin.middleware');
const { validate } = require('../middlewares/validation.middleware');

// Middleware to handle both user and admin auth
const authenticateUserOrAdmin = (req, res, next) => {
  const userToken = req.headers.authorization;
  
  if (userToken) {
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
 * @route   POST /api/fcm/register
 * @desc    Register FCM token
 * @access  Private
 */
router.post(
  '/register',
  authenticateUserOrAdmin,
  [
    body('fcmToken')
      .trim()
      .notEmpty()
      .withMessage('FCM token is required'),
    body('deviceType')
      .optional()
      .isIn(['android', 'ios', 'web'])
      .withMessage('Invalid device type'),
  ],
  validate,
  fcmController.registerToken
);

/**
 * @route   DELETE /api/fcm/unregister
 * @desc    Unregister FCM token
 * @access  Private
 */
router.delete(
  '/unregister',
  authenticateUserOrAdmin,
  [
    body('fcmToken')
      .trim()
      .notEmpty()
      .withMessage('FCM token is required'),
  ],
  validate,
  fcmController.unregisterToken
);

/**
 * @route   GET /api/fcm/tokens
 * @desc    Get all FCM tokens for current user/admin
 * @access  Private
 */
router.get('/tokens', authenticateUserOrAdmin, fcmController.getTokens);

module.exports = router;