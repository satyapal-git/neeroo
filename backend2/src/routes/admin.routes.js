const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protectAdmin } = require('../middlewares/admin.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { otpLimiter, authLimiter } = require('../middlewares/rateLimiter.middleware');

/**
 * @route   POST /api/admin/signup
 * @desc    Admin signup
 * @access  Public
 */
router.post(
  '/signup',
  [
    body('mobile')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('restaurantId')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Restaurant ID must be at least 3 characters')
      .matches(/^[A-Z0-9]+$/i)
      .withMessage('Restaurant ID can only contain letters and numbers'),
  ],
  validate,
  adminController.adminSignup
);

/**
 * @route   POST /api/admin/send-otp
 * @desc    Send OTP to admin mobile
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
  adminController.sendAdminOTP
);

/**
 * @route   POST /api/admin/verify-otp
 * @desc    Verify OTP and login admin
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
  adminController.verifyAdminOTP
);

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get('/profile', protectAdmin, adminController.getAdminProfile);

module.exports = router;