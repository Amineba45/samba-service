'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendCreated, sendError } = require('../utils/responseHandler');

/**
 * Sign a JWT token for a given user ID
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email: String(email) });
    if (existing) {
      return sendError(
        res,
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        HTTP_STATUS.CONFLICT,
        APP_ERROR_CODES.EMAIL_ALREADY_EXISTS
      );
    }

    const user = await User.create({ firstName, lastName, email, password, phone, role });

    const token = signToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    return sendCreated(res, { token, user: userData }, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email) }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(
        res,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
        APP_ERROR_CODES.INVALID_CREDENTIALS
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

    const token = signToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    return sendSuccess(res, { token, user: userData }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client should discard token)
 * @access  Private
 */
const logout = (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
