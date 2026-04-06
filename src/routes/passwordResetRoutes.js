'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { passwordResetRequestSchema, passwordResetSchema } = require('../validation/schemas');
const logger = require('../config/logger');

// In-memory token store. In production, persist tokens in the database with expiration.
const resetTokens = new Map();

// Periodically clean up expired tokens to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of resetTokens.entries()) {
        if (value.expires < now) {
            resetTokens.delete(key);
        }
    }
}, 10 * 60 * 1000); // every 10 minutes

router.post('/request', authLimiter, validateRequest(passwordResetRequestSchema), async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: String(email) });

        // Always respond with success to avoid user enumeration
        if (!user) {
            return res.json({ success: true, message: 'If that email is registered, a reset link has been sent' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        resetTokens.set(token, { userId: user._id.toString(), expires: Date.now() + 3600000 }); // 1 hour

        logger.info(`Password reset requested for user: ${user._id}`);

        // TODO: Send token via email using nodemailer in production
        // In development mode, return token for testing purposes only
        const response = { success: true, message: 'If that email is registered, a reset link has been sent' };
        if (process.env.NODE_ENV === 'development') {
            response.token = token;
        }
        res.json(response);
    } catch (err) {
        next(err);
    }
});

router.post('/reset', authLimiter, validateRequest(passwordResetSchema), async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const entry = resetTokens.get(String(token));

        if (!entry || entry.expires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(entry.userId),
            { $set: { password: hashedPassword } }
        );

        resetTokens.delete(String(token));
        logger.info(`Password reset for user: ${entry.userId}`);
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
