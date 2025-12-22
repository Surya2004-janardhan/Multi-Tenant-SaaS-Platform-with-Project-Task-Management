// Error Handler Middleware
// Global error handling and response formatting

const { buildErrorResponse } = require('../utils/helpers');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.message) {
    message = err.message;
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  res.status(statusCode).json(buildErrorResponse(message));
};

const notFoundHandler = (req, res) => {
  res.status(404).json(buildErrorResponse('Route not found'));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
