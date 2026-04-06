'use strict';

const User = require('../models/User');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sanitizeUpdateData } = require('../validation/validators');
const { uploadImage, deleteImage } = require('../utils/fileUpload');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.USER_NOT_FOUND);
    }
    return sendSuccess(res, { user }, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const sanitized = sanitizeUpdateData(req.body);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: sanitized },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/users/change-password
 * @desc    Change current user's password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return sendError(
        res,
        ERROR_MESSAGES.INVALID_PASSWORD,
        HTTP_STATUS.BAD_REQUEST,
        APP_ERROR_CODES.INVALID_PASSWORD
      );
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/avatar
 * @desc    Upload/update user avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar if exists
    if (user.avatar && user.avatar.publicId) {
      await deleteImage(user.avatar.publicId);
    }

    const { url, publicId } = await uploadImage(req.file.buffer, 'samba-service/avatars');

    user.avatar = { url, publicId };
    await user.save();

    return sendSuccess(res, { avatar: user.avatar }, 'Avatar updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/users/account
 * @desc    Deactivate current user's account
 * @access  Private
 */
const deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { isActive: false } });
    return sendSuccess(res, null, 'Account deactivated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── Admin-only ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/users
 * @desc    Get all users (admin)
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    return sendSuccess(res, { users, total: users.length }, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID (admin)
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.USER_NOT_FOUND);
    }
    return sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (admin)
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.USER_NOT_FOUND);
    }
    return sendSuccess(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deactivateAccount,
  getAllUsers,
  getUserById,
  deleteUser,
};
