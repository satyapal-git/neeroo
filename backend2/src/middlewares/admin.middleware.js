const { verifyToken } = require('../utils/jwt.util');
const Admin = require('../models/Admin.model');
const MESSAGES = require('../constants/messages.constant');
const { errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * Protect Admin Routes
 */
const protectAdmin = async (req, res, next) => {
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

    // Check if admin exists
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return errorResponse(res, MESSAGES.ERROR.ADMIN_NOT_FOUND, 401);
    }

    // Check if role is admin
    if (decoded.role !== 'admin') {
      return errorResponse(res, MESSAGES.ERROR.FORBIDDEN, 403);
    }

    // Attach admin to request
    req.admin = admin;
    req.adminId = admin._id;

    next();

  } catch (error) {
    logger.error(`Admin auth middleware error: ${error.message}`);
    
    if (error.message === 'Invalid or expired token') {
      return errorResponse(res, MESSAGES.ERROR.TOKEN_EXPIRED, 401);
    }
    
    return errorResponse(res, MESSAGES.ERROR.UNAUTHORIZED, 401);
  }
};

/**
 * Check Super Admin
 */
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.admin || !req.admin.isSuperAdmin) {
      return errorResponse(res, 'Super admin access required', 403);
    }

    next();

  } catch (error) {
    logger.error(`Super admin check error: ${error.message}`);
    return errorResponse(res, MESSAGES.ERROR.FORBIDDEN, 403);
  }
};

module.exports = {
  protectAdmin,
  isSuperAdmin,
};