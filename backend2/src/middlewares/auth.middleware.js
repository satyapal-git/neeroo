const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/User.model');
const MESSAGES = require('../constants/messages.constant');
const { errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * Protect Routes - Verify JWT Token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return errorResponse(res, MESSAGES.ERROR.UNAUTHORIZED, 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, MESSAGES.ERROR.USER_NOT_FOUND, 401);
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();

  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    
    if (error.message === 'Invalid or expired token') {
      return errorResponse(res, MESSAGES.ERROR.TOKEN_EXPIRED, 401);
    }
    
    return errorResponse(res, MESSAGES.ERROR.UNAUTHORIZED, 401);
  }
};

/**
 * Optional Auth - Verify token if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();

  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};