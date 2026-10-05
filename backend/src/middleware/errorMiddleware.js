/**
 * 404 Route Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`
  });
};

/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}': ${err.value}`;
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicatedFields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate key error: A record with this ${duplicatedFields || 'value'} already exists.`;
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationMessages = Object.values(err.errors).map((e) => e.message);
    message = validationMessages.join('; ');
  }

  // JWT Specific Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized: Invalid token signature';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized: Token has expired';
  }

  // Log error details internally (never expose stack trace to user)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message} | Route: ${req.method} ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
