'use strict';

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      errorCode: APP_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Stricter limiter for auth routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      errorCode: APP_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    });
  },
});

module.exports = { apiLimiter, authLimiter };
