const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const { successResponse, errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * @desc    Register FCM Token
 * @route   POST /api/fcm/register
 * @access  Private (User/Admin)
 */
const registerToken = async (req, res) => {
  try {
    const { fcmToken, deviceType } = req.body;

    if (!fcmToken) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    let model, id, userType;
    
    if (req.userId) {
      model = User;
      id = req.userId;
      userType = 'user';
    } else if (req.adminId) {
      model = Admin;
      id = req.adminId;
      userType = 'admin';
    } else {
      return errorResponse(res, 'Unauthorized', 401);
    }

    // Find user/admin
    const entity = await model.findById(id);
    
    if (!entity) {
      return errorResponse(res, `${userType} not found`, 404);
    }

    // Initialize fcmTokens array if it doesn't exist
    if (!entity.fcmTokens) {
      entity.fcmTokens = [];
    }

    // Check if token already exists
    const tokenExists = entity.fcmTokens.some(t => t.token === fcmToken);
    
    if (!tokenExists) {
      entity.fcmTokens.push({
        token: fcmToken,
        deviceType: deviceType || 'web',
        createdAt: new Date(),
      });
      await entity.save();
      logger.info(`FCM token registered for ${userType}: ${id}`);
    } else {
      logger.info(`FCM token already exists for ${userType}: ${id}`);
    }

    return successResponse(res, 'FCM token registered successfully', {
      tokensCount: entity.fcmTokens.length,
    });

  } catch (error) {
    logger.error(`Register FCM token error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Remove FCM Token
 * @route   DELETE /api/fcm/unregister
 * @access  Private (User/Admin)
 */
const unregisterToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return errorResponse(res, 'FCM token is required', 400);
    }

    let model, id, userType;
    
    if (req.userId) {
      model = User;
      id = req.userId;
      userType = 'user';
    } else if (req.adminId) {
      model = Admin;
      id = req.adminId;
      userType = 'admin';
    } else {
      return errorResponse(res, 'Unauthorized', 401);
    }

    // Remove token
    await model.findByIdAndUpdate(id, {
      $pull: { fcmTokens: { token: fcmToken } },
    });

    logger.info(`FCM token removed for ${userType}: ${id}`);
    return successResponse(res, 'FCM token removed successfully');

  } catch (error) {
    logger.error(`Unregister FCM token error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get All FCM Tokens
 * @route   GET /api/fcm/tokens
 * @access  Private (User/Admin)
 */
const getTokens = async (req, res) => {
  try {
    let model, id, userType;
    
    if (req.userId) {
      model = User;
      id = req.userId;
      userType = 'user';
    } else if (req.adminId) {
      model = Admin;
      id = req.adminId;
      userType = 'admin';
    } else {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const entity = await model.findById(id).select('fcmTokens');
    
    if (!entity) {
      return errorResponse(res, `${userType} not found`, 404);
    }

    return successResponse(res, 'FCM tokens fetched successfully', {
      tokens: entity.fcmTokens || [],
      count: entity.fcmTokens ? entity.fcmTokens.length : 0,
    });

  } catch (error) {
    logger.error(`Get FCM tokens error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  getTokens,
};