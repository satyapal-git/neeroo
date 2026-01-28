const User = require('../models/User.model');
const otpService = require('../services/otp.service');
const { generateToken } = require('../utils/jwt.util');
const { successResponse, errorResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Send OTP to User
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendUserOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body || {};

    if (!mobile) {
      return errorResponse(res, 'Mobile number is required', 400);
    }

    // Send OTP
    const result = await otpService.sendOTP(mobile, 'user');

    return successResponse(res, result.message, {
      mobile,
      expiresAt: result.expiresAt,
    });

  } catch (error) {
    logger.error(`Send User OTP Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Verify OTP and Login/Signup User
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyUserOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body || {};

    if (!mobile || !otp) {
      return errorResponse(
        res,
        'Mobile number and OTP are required',
        400
      );
    }

    // Verify OTP
    const otpResult = await otpService.verifyOTP(mobile, otp, 'user');

    if (!otpResult.success) {
      return errorResponse(res, otpResult.message, 400);
    }

    // Find or create user
    let user = await User.findByMobile(mobile);

    if (!user) {
      // Create new user
      user = await User.create({ mobile });
      logger.info(`New user created: ${mobile}`);
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      mobile: user.mobile,
      role: 'user',
    });

    return successResponse(res, MESSAGES.SUCCESS.LOGIN_SUCCESS, {
      token,
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    logger.error(`Verify User OTP Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
    }

    return successResponse(res, 'Profile fetched successfully', {
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    logger.error(`Get User Profile Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, MESSAGES.ERROR.USER_NOT_FOUND, 404);
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    await user.save();

    logger.info(`User profile updated: ${user.mobile}`);

    return successResponse(res, MESSAGES.SUCCESS.PROFILE_UPDATED, {
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    logger.error(`Update User Profile Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  sendUserOTP,
  verifyUserOTP,
  getUserProfile,
  updateUserProfile,
};