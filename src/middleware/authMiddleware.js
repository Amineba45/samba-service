'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendError } = require('../utils/responseHandler');

/**
 * Protect routes – verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return sendError(
      res,
      ERROR_MESSAGES.NOT_AUTHENTICATED,
      HTTP_STATUS.UNAUTHORIZED,
      APP_ERROR_CODES.NOT_AUTHENTICATED
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return sendError(
        res,
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.UNAUTHORIZED,
        APP_ERROR_CODES.TOKEN_INVALID
      );
    }

    if (!user.isActive) {
      return sendError(
        res,
        ERROR_MESSAGES.ACCOUNT_INACTIVE,
        HTTP_STATUS.FORBIDDEN,
        APP_ERROR_CODES.ACCOUNT_INACTIVE
      );
    }

    if (user.passwordChangedAfter(decoded.iat)) {
      return sendError(
        res,
        ERROR_MESSAGES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
        APP_ERROR_CODES.TOKEN_EXPIRED
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(
        res,
        ERROR_MESSAGES.TOKEN_EXPIRED,
        HTTP_STATUS.UNAUTHORIZED,
        APP_ERROR_CODES.TOKEN_EXPIRED
      );
    }
    return sendError(
      res,
      ERROR_MESSAGES.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED,
      APP_ERROR_CODES.TOKEN_INVALID
    );
  }
};

/**
 * Restrict access to specific roles
 * @param {...string} roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        ERROR_MESSAGES.NOT_AUTHORIZED,
        HTTP_STATUS.FORBIDDEN,
        APP_ERROR_CODES.NOT_AUTHORIZED
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
