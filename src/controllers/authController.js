'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../config/logger');

const SALT_ROUNDS = 12;
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

const generateTokens = (userId) => {
    const access = jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
    const refresh = jwt.sign({ id: String(userId) }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_EXPIRES });
    return { access, refresh };
};

/** POST /api/auth/register */
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        const existing = await User.findOne({ email: String(email) });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ firstName, lastName, email: String(email), passwordHash, phone });
        const { access, refresh } = generateTokens(user._id);
        user.refreshToken = refresh;
        await user.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token: access,
            refreshToken: refresh,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/login */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: String(email) });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        const { access, refresh } = generateTokens(user._id);
        user.refreshToken = refresh;
        await user.save();
        res.json({
            success: true,
            token: access,
            refreshToken: refresh,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/logout */
exports.logout = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                await User.findByIdAndUpdate(new mongoose.Types.ObjectId(decoded.id), { $unset: { refreshToken: 1 } });
            } catch (_) { /* ignore invalid token on logout */ }
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/refresh-token */
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required.' });
        }
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        } catch (_) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
        }
        const user = await User.findById(new mongoose.Types.ObjectId(decoded.id));
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
        }
        const { access, refresh } = generateTokens(user._id);
        user.refreshToken = refresh;
        await user.save();
        res.json({ success: true, token: access, refreshToken: refresh });
    } catch (err) {
        next(err);
    }
};