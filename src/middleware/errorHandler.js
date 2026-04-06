'use strict';

const logger = require('../config/logger');
const { HTTP_STATUS } = require('../../constants/errorCodes');

/**
 * Convert a Mongoose validation error to a readable message
 */
const handleMongooseValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message: messages.join('. '),
  };
};

/**
 * Handle MongoDB duplicate key errors (E11000)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: HTTP_STATUS.CONFLICT,
    message: `Duplicate value for field: ${field}`,
  };
};

/**
 * Handle MongoDB CastError (invalid ObjectId, etc.)
 */
const handleCastError = (err) => ({
  statusCode: HTTP_STATUS.BAD_REQUEST,
  message: `Invalid ${err.path}: ${err.value}`,
});

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'An unexpected error occurred';

  // Known Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    ({ statusCode, message } = handleMongooseValidationError(err));
  } else if (err.code === 11000) {
    ({ statusCode, message } = handleDuplicateKeyError(err));
  } else if (err.name === 'CastError') {
    ({ statusCode, message } = handleCastError(err));
  } else if (err.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `File upload error: ${err.message}`;
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
      stack: err.stack,
    });
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err.errorCode) {
    response.errorCode = err.errorCode;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
