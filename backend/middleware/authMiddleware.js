const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-secret-key-2024';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.query.token;

    // Check if no token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive',
          code: 'ACCOUNT_INACTIVE'
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your mobile number first',
          code: 'NOT_VERIFIED'
        });
      }

      // Add user to request object
      req.user = {
        id: user._id,
        mobile: user.mobile,
        profile: user.profile,
        loyaltyPoints: user.loyaltyPoints,
        isVerified: user.isVerified
      };

      next();

    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.query.token;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.status === 'active' && user.isVerified) {
        req.user = {
          id: user._id,
          mobile: user.mobile,
          profile: user.profile,
          loyaltyPoints: user.loyaltyPoints,
          isVerified: user.isVerified
        };
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-admin-token') ||
                  req.query.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.',
        code: 'NO_ADMIN_TOKEN'
      });
    }

    try {
      const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-2024';
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      
      if (decoded.type !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      const Admin = require('../models/Admin');
      const admin = await Admin.findById(decoded.adminId);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found or account inactive',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      req.admin = {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      };

      next();

    } catch (tokenError) {
      console.error('Admin token verification error:', tokenError);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Admin token has expired',
          code: 'ADMIN_TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token',
        code: 'INVALID_ADMIN_TOKEN'
      });
    }

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication',
      code: 'ADMIN_AUTH_SERVER_ERROR'
    });
  }
};

// Permission checking middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super-admin') {
      return next();
    }

    // Check if admin has the required permission
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${permission}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Rate limiting for authentication endpoints
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip + (req.body.mobile || req.body.username || '');
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(key);
      }
    }
    
    // Check current attempts
    const userAttempts = attempts.get(identifier);
    
    if (userAttempts && userAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((userAttempts.firstAttempt + windowMs - now) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${timeLeft} minutes.`,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    // Track this attempt
    if (userAttempts) {
      userAttempts.count++;
    } else {
      attempts.set(identifier, {
        count: 1,
        firstAttempt: now
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuth,
  requirePermission,
  authRateLimit
};