const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { otpLimiter, authLimiter } = require('../middlewares/rateLimiter.middleware');

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user mobile
 * @access  Public
 */
router.post(
  '/send-otp',
  otpLimiter,
  [
    body('mobile')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
  ],
  validate,
  authController.sendUserOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login/signup user
 * @access  Public
 */
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('mobile')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
      .isNumeric()
      .withMessage('OTP must contain only numbers'),
  ],
  validate,
  authController.verifyUserOTP
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, authController.getUserProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
  ],
  validate,
  authController.updateUserProfile
);

module.exports = router;