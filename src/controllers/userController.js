'use strict';

const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../config/logger');
const { sanitizeUpdateData } = require('../utils/validators');

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(new mongoose.Types.ObjectId(req.user.id)).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'phone'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        const sanitized = sanitizeUpdateData(updates);
        const user = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.user.id),
            { $set: sanitized },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        logger.info(`User profile updated: ${user._id}`);
        res.json({ success: true, message: 'Profile updated', user });
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        logger.info(`User deleted: ${req.params.id}`);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getUserProfile, updateUserProfile, getAllUsers, deleteUser };
