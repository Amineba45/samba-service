'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const existing = await User.findOne({ email: String(email) });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ firstName, lastName, email, password: hashedPassword, phone });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        logger.info(`User registered: ${user._id}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: String(email) });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        logger.info(`User logged in: ${user._id}`);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
};

const logout = (req, res) => {
    // JWT is stateless; client should discard the token.
    res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
