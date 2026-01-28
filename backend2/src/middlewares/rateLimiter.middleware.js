const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app.config');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs, // 15 minutes
  max: appConfig.rateLimit.maxRequests, // 100 requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP Rate Limiter (stricter)
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false,
});

/**
 * Auth Rate Limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

/**
 * Upload Rate Limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.',
  },
});

module.exports = apiLimiter;
module.exports.otpLimiter = otpLimiter;
module.exports.authLimiter = authLimiter;
module.exports.uploadLimiter = uploadLimiter;