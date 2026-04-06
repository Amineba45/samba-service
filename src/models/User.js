'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone:     { type: String, trim: true },
    profilePicture: { type: String },
    role:      { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
