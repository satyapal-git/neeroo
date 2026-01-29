/**
 * Async Handler Wrapper
 * Wraps async functions and passes errors to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;