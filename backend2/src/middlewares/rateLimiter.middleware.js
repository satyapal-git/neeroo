const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app.config');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs, // 15 minutes
  max: appConfig.nodeEnv === 'development' ? 1000 : appConfig.rateLimit.maxRequests, // ✅ 1000 in dev, 100 in prod
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
  max: appConfig.nodeEnv === 'development' ? 50 : 5, // ✅ 50 in dev, 5 in prod
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
  max: appConfig.nodeEnv === 'development' ? 100 : 10, // ✅ 100 in dev, 10 in prod
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
  max: appConfig.nodeEnv === 'development' ? 100 : 20, // ✅ 100 in dev, 20 in prod
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.',
  },
});

module.exports = apiLimiter;
module.exports.otpLimiter = otpLimiter;
module.exports.authLimiter = authLimiter;
module.exports.uploadLimiter = uploadLimiter;