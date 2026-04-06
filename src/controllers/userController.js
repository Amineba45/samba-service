'use strict';

const User = require('../models/User');
const { sanitizeUpdateData, toObjectId } = require('../utils/validators');

/** GET /api/users/profile */
exports.getUserProfile = async (req, res, next) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        next(err);
    }
};

/** PUT /api/users/profile */
exports.updateUserProfile = async (req, res, next) => {
    try {
        const allowed = ['firstName', 'lastName', 'phone', 'profilePicture'];
        const raw = {};
        allowed.forEach((k) => { if (req.body[k] !== undefined) raw[k] = req.body[k]; });
        const sanitized = sanitizeUpdateData(raw);
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: sanitized },
            { new: true, runValidators: true }
        ).select('-passwordHash -refreshToken');
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

/** GET /api/users/ (admin only) */
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find({}).select('-passwordHash -refreshToken').skip(skip).limit(limit),
            User.countDocuments()
        ]);
        res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** DELETE /api/users/:id (admin only) */
exports.deleteUser = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
        next(err);
    }
};

/** POST /api/users/upload-picture */
exports.uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }
        const url = `/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { profilePicture: url } },
            { new: true }
        ).select('-passwordHash -refreshToken');
        res.json({ success: true, profilePicture: url, user });
    } catch (err) {
        next(err);
    }
};