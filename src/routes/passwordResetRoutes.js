'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { passwordResetRequestSchema, passwordResetSchema } = require('../validation/schemas');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

/** POST /api/password-reset/request */
router.post('/request', authLimiter, validateRequest(passwordResetRequestSchema), async (req, res, next) => {
    try {
        const user = await User.findOne({ email: String(req.body.email) });
        // Always respond 200 to prevent user enumeration
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = token;
        user.passwordResetExpires = new Date(Date.now() + TOKEN_EXPIRES_MS);
        await user.save();

        // In production, send via nodemailer. Log for development.
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        logger.info(`Password reset link for ${user.email}: ${resetUrl}`);

        res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
        next(err);
    }
});

/** POST /api/password-reset/reset */
router.post('/reset', authLimiter, validateRequest(passwordResetSchema), async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            passwordResetToken: String(token),
            passwordResetExpires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }
        user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = undefined;
        await user.save();
        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
