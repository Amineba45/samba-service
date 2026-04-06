'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @swagger
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         owner:
 *           type: string
 *         isActive:
 *           type: boolean
 */
const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Store must have an owner'],
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    banner: {
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
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storeSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'store',
});

// Auto-generate slug from name
storeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
