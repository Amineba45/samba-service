'use strict';

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product:
 *           type: string
 *         user:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 */
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to update product average rating
reviewSchema.statics.updateProductRating = async function (productId) {
  const Product = mongoose.model('Product');
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.updateProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.updateProductRating(doc.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
