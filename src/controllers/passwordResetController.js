'use strict';

const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: String(email) });
    // Always return success to prevent user enumeration
    if (!user) {
      return sendSuccess(res, null, 'If that email is registered, you will receive a reset link');
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES, 10) || 10;
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + expiresMinutes * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for your Samba Service account.</p>
      <p>Click the link below to reset your password. This link will expire in ${expiresMinutes} minutes.</p>
      <a href="${resetUrl}" style="background:#4F46E5;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Samba Service – Password Reset',
        html,
        text: `Reset your password: ${resetUrl}`,
      });
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(emailErr);
    }

    return sendSuccess(res, null, 'If that email is registered, you will receive a reset link');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendError(
        res,
        'Invalid or expired password reset token',
        HTTP_STATUS.BAD_REQUEST,
        APP_ERROR_CODES.TOKEN_INVALID
      );
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Password has been reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
};

module.exports = { forgotPassword, resetPassword };
