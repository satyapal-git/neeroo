const Admin = require('../models/Admin.model');
const otpService = require('../services/otp.service');
const { generateToken } = require('../utils/jwt.util');
const { successResponse, errorResponse, createdResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Admin Signup
 * @route   POST /api/admin/signup
 * @access  Public
 */
const adminSignup = async (req, res, next) => {
  try {
    const { mobile, email, restaurantId } = req.body;

    // Check if admin already exists
    const existingMobile = await Admin.findByMobile(mobile);
    if (existingMobile) {
      return errorResponse(res, MESSAGES.ERROR.DUPLICATE_MOBILE, 400);
    }

    const existingEmail = await Admin.findByEmail(email);
    if (existingEmail) {
      return errorResponse(res, MESSAGES.ERROR.DUPLICATE_EMAIL, 400);
    }

    const existingRestaurantId = await Admin.findByRestaurantId(restaurantId);
    if (existingRestaurantId) {
      return errorResponse(res, MESSAGES.ERROR.DUPLICATE_RESTAURANT_ID, 400);
    }

    // Create admin
    const admin = await Admin.create({
      mobile,
      email: email.toLowerCase(),
      restaurantId: restaurantId.toUpperCase(),
    });

    logger.info(`New admin created: ${admin.mobile}`);

    return createdResponse(res, MESSAGES.SUCCESS.SIGNUP_SUCCESS, {
      admin: {
        _id: admin._id,
        mobile: admin.mobile,
        email: admin.email,
        restaurantId: admin.restaurantId,
      },
    });

  } catch (error) {
    logger.error(`Admin Signup Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Send OTP to Admin
 * @route   POST /api/admin/send-otp
 * @access  Public
 */
const sendAdminOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    // Check if admin exists
    const admin = await Admin.findByMobile(mobile);
    if (!admin) {
      return errorResponse(res, MESSAGES.ERROR.ADMIN_NOT_FOUND, 404);
    }

    // Send OTP
    const result = await otpService.sendOTP(mobile, 'admin');

    return successResponse(res, result.message, {
      mobile,
      expiresAt: result.expiresAt,
    });

  } catch (error) {
    logger.error(`Send Admin OTP Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Verify OTP and Login Admin
 * @route   POST /api/admin/verify-otp
 * @access  Public
 */
const verifyAdminOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    // Verify OTP
    const otpResult = await otpService.verifyOTP(mobile, otp, 'admin');

    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }

    // Find admin
    const admin = await Admin.findByMobile(mobile);

    if (!admin) {
      return errorResponse(res, MESSAGES.ERROR.ADMIN_NOT_FOUND, 404);
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      mobile: admin.mobile,
      role: 'admin',
    });

    return successResponse(res, MESSAGES.SUCCESS.LOGIN_SUCCESS, {
      token,
      admin: {
        _id: admin._id,
        mobile: admin.mobile,
        email: admin.email,
        restaurantId: admin.restaurantId,
        isActive: admin.isActive,
      },
    });

  } catch (error) {
    logger.error(`Verify Admin OTP Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Admin Profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin)
 */
const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return errorResponse(res, MESSAGES.ERROR.ADMIN_NOT_FOUND, 404);
    }

    return successResponse(res, 'Profile fetched successfully', {
      admin: {
        _id: admin._id,
        mobile: admin.mobile,
        email: admin.email,
        restaurantId: admin.restaurantId,
        isActive: admin.isActive,
        isSuperAdmin: admin.isSuperAdmin,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });

  } catch (error) {
    logger.error(`Get Admin Profile Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  adminSignup,
  sendAdminOTP,
  verifyAdminOTP,
  getAdminProfile,
};