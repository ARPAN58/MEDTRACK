const logger = require('../utils/logger');

// Custom API Error class
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Async wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log error details
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    details: err.details,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Handle known error types
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    err.message = `${field} already exists`;
    err.statusCode = 409;
  }

  if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token';
    err.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    err.message = 'Token expired';
    err.statusCode = 401;
  }

  if (err.name === 'ValidationError') {
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { details: err.details, stack: err.stack }),
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
};
