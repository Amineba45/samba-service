'use strict';

const Product = require('../models/Product');
const Store = require('../models/Store');
const Review = require('../models/Review');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendCreated, sendError, sendPaginatedSuccess } = require('../utils/responseHandler');
const { sanitizeUpdateData, isValidObjectId, getPagination, buildPaginationResult } = require('../validation/validators');
const { uploadMultipleImages, deleteImage } = require('../utils/fileUpload');

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (seller/admin)
 */
const createProduct = async (req, res, next) => {
  try {
    // Verify store ownership
    const store = await Store.findById(req.body.store);
    if (!store) {
      return sendError(res, ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.STORE_NOT_FOUND);
    }
    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map((f) => f.buffer);
      const uploaded = await uploadMultipleImages(buffers, 'samba-service/products');
      images = uploaded.map(({ url, publicId }, i) => ({ url, publicId, alt: req.body.name || `Image ${i + 1}` }));
    }

    const product = await Product.create({ ...req.body, images });
    return sendCreated(res, { product }, 'Product created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/products
 * @desc    Get all active products (paginated, filterable)
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isActive: true };

    if (req.query.category && isValidObjectId(req.query.category)) filter.category = req.query.category;
    if (req.query.store && isValidObjectId(req.query.store)) filter.store = req.query.store;
    if (req.query.search) filter.$text = { $search: String(req.query.search) };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.featured === 'true') filter.isFeatured = true;

    let sortQuery = '-createdAt';
    if (req.query.sort === 'price_asc') sortQuery = 'price';
    else if (req.query.sort === 'price_desc') sortQuery = '-price';
    else if (req.query.sort === 'rating') sortQuery = '-rating';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('store', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort(sortQuery),
      Product.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, products, buildPaginationResult(total, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('store', 'name slug logo');

    if (!product) {
      return sendError(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return sendSuccess(res, { product }, 'Product retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/products/:id
 * @desc    Update a product
 * @access  Private (store owner/admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    if (!product) {
      return sendError(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (product.store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    const sanitized = sanitizeUpdateData(req.body);
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: sanitized },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { product: updated }, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (store owner/admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    if (!product) {
      return sendError(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (product.store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) await deleteImage(img.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/products/:id/reviews
 * @desc    Get reviews for a product
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.id })
        .populate('user', 'firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Review.countDocuments({ product: req.params.id }),
    ]);

    return sendPaginatedSuccess(res, reviews, buildPaginationResult(total, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Create a review for a product
 * @access  Private
 */
const createProductReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const existingReview = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (existingReview) {
      return sendError(res, ERROR_MESSAGES.REVIEW_ALREADY_EXISTS, HTTP_STATUS.CONFLICT, APP_ERROR_CODES.REVIEW_ALREADY_EXISTS);
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return sendCreated(res, { review }, 'Review submitted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductReviews,
  createProductReview,
};
