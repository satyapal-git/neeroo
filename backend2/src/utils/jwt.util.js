const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');

/**
 * Generate JWT Token
 */
const generateToken = (payload, expiresIn = appConfig.jwt.expire) => {
  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn,
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, appConfig.jwt.refreshSecret, {
    expiresIn: appConfig.jwt.refreshExpire,
  });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, appConfig.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, appConfig.jwt.refreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Decode Token without verification
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
};