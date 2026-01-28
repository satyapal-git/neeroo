const logger = require('../utils/logger.util');
const MESSAGES = require('../constants/messages.constant');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || MESSAGES.ERROR.SERVER_ERROR;

  // Log error
  logger.error(`Error: ${message}`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = MESSAGES.ERROR.INVALID_TOKEN;
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = MESSAGES.ERROR.TOKEN_EXPIRED;
    statusCode = 401;
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = MESSAGES.ERROR.FILE_TOO_LARGE;
    } else {
      message = err.message;
    }
    statusCode = 400;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

/**
 * Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = errorHandler;
module.exports.notFound = notFound;