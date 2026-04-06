'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         phone:
 *           type: string
 *         avatar:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password was changed after a JWT was issued
userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
