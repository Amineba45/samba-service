'use strict';

const Store = require('../models/Store');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendCreated, sendError, sendPaginatedSuccess } = require('../utils/responseHandler');
const { sanitizeUpdateData, getPagination, buildPaginationResult } = require('../validation/validators');
const { uploadImage, deleteImage } = require('../utils/fileUpload');

/**
 * @route   POST /api/stores
 * @desc    Create a new store
 * @access  Private (seller/admin)
 */
const createStore = async (req, res, next) => {
  try {
    const existing = await Store.findOne({ name: String(req.body.name) });
    if (existing) {
      return sendError(res, ERROR_MESSAGES.STORE_ALREADY_EXISTS, HTTP_STATUS.CONFLICT, APP_ERROR_CODES.STORE_ALREADY_EXISTS);
    }

    const store = await Store.create({ ...req.body, owner: req.user._id });
    return sendCreated(res, { store }, 'Store created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/stores
 * @desc    Get all active stores (paginated)
 * @access  Public
 */
const getStores = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [stores, total] = await Promise.all([
      Store.find(filter).populate('owner', 'firstName lastName email').skip(skip).limit(limit).sort('-createdAt'),
      Store.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, stores, buildPaginationResult(total, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/stores/:id
 * @desc    Get store by ID
 * @access  Public
 */
const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id).populate('owner', 'firstName lastName email');
    if (!store) {
      return sendError(res, ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.STORE_NOT_FOUND);
    }
    return sendSuccess(res, { store }, 'Store retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/stores/:id
 * @desc    Update a store
 * @access  Private (owner/admin)
 */
const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return sendError(res, ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.STORE_NOT_FOUND);
    }

    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_STORE_OWNER, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    const sanitized = sanitizeUpdateData(req.body);
    const updated = await Store.findByIdAndUpdate(
      req.params.id,
      { $set: sanitized },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { store: updated }, 'Store updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete a store
 * @access  Private (owner/admin)
 */
const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return sendError(res, ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.STORE_NOT_FOUND);
    }

    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_STORE_OWNER, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    // Clean up images
    if (store.logo && store.logo.publicId) await deleteImage(store.logo.publicId);
    if (store.banner && store.banner.publicId) await deleteImage(store.banner.publicId);

    await Store.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Store deleted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/stores/:id/logo
 * @desc    Upload store logo
 * @access  Private (owner/admin)
 */
const uploadStoreLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', HTTP_STATUS.BAD_REQUEST);
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      return sendError(res, ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.STORE_NOT_FOUND);
    }

    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_STORE_OWNER, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    if (store.logo && store.logo.publicId) await deleteImage(store.logo.publicId);

    const { url, publicId } = await uploadImage(req.file.buffer, 'samba-service/store-logos');
    store.logo = { url, publicId };
    await store.save();

    return sendSuccess(res, { logo: store.logo }, 'Logo uploaded successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/stores/my
 * @desc    Get stores owned by current user
 * @access  Private
 */
const getMyStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ owner: req.user._id }).sort('-createdAt');
    return sendSuccess(res, { stores, total: stores.length }, 'Your stores retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  uploadStoreLogo,
  getMyStores,
};
