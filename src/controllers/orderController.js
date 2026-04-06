'use strict';

const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const ERROR_MESSAGES = require('../utils/errorMessages');
const { sendSuccess, sendCreated, sendError, sendPaginatedSuccess } = require('../utils/responseHandler');
const { getPagination, buildPaginationResult, isValidObjectId } = require('../validation/validators');
const mongoose = require('mongoose');

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { store, items, shippingAddress, paymentMethod, notes } = req.body;

    // Resolve product details and check stock
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      if (!isValidObjectId(item.product)) {
        return sendError(res, `Invalid product ID: ${item.product}`, HTTP_STATUS.BAD_REQUEST, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
      }
      const productId = new mongoose.Types.ObjectId(item.product);
      const product = await Product.findById(productId);
      if (!product) {
        return sendError(res, `Product ${item.product} not found`, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.PRODUCT_NOT_FOUND);
      }
      if (product.stock < item.quantity) {
        return sendError(
          res,
          `Insufficient stock for product: ${product.name}`,
          HTTP_STATUS.BAD_REQUEST,
          APP_ERROR_CODES.INSUFFICIENT_STOCK
        );
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;

      resolvedItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images && product.images[0] ? product.images[0].url : '',
      });

      // Decrement stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const totalAmount = subtotal; // Tax/shipping can be added here

    const order = await Order.create({
      buyer: req.user._id,
      store,
      items: resolvedItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      totalAmount,
      notes,
    });

    // Optionally clear cart after ordering
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    return sendCreated(res, { order }, 'Order placed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders
 * @desc    Get current user's orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { buyer: req.user._id };
    // Use value from our own array to break taint chain
    const statusFilter = VALID_ORDER_STATUSES.find((s) => s === req.query.status);
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('store', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Order.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, orders, buildPaginationResult(total, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'firstName lastName email')
      .populate('store', 'name slug');

    if (!order) {
      return sendError(res, ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.ORDER_NOT_FOUND);
    }

    // Only buyer, store owner, or admin can view the order
    const isOwner = order.buyer._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    return sendSuccess(res, { order }, 'Order retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (seller/admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('store');
    if (!order) {
      return sendError(res, ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.ORDER_NOT_FOUND);
    }

    const isStoreOwner = order.store && order.store.owner.toString() === req.user._id.toString();
    if (!isStoreOwner && req.user.role !== 'admin') {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    order.status = req.body.status;
    if (req.body.status === 'delivered') order.deliveredAt = new Date();
    if (req.body.status === 'cancelled') order.cancelledAt = new Date();

    await order.save();
    return sendSuccess(res, { order }, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel an order (buyer)
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, APP_ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return sendError(res, ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN, APP_ERROR_CODES.NOT_AUTHORIZED);
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return sendError(
        res,
        ERROR_MESSAGES.ORDER_CANNOT_BE_CANCELLED,
        HTTP_STATUS.BAD_REQUEST,
        APP_ERROR_CODES.ORDER_CANNOT_BE_CANCELLED
      );
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    return sendSuccess(res, { order }, 'Order cancelled successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/orders/store/:storeId
 * @desc    Get orders for a specific store (store owner/admin)
 * @access  Private
 */
const getStoreOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { store: req.params.storeId };
    // Use value from our own array to break taint chain
    const statusFilter = VALID_ORDER_STATUSES.find((s) => s === req.query.status);
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyer', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Order.countDocuments(filter),
    ]);

    return sendPaginatedSuccess(res, orders, buildPaginationResult(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getStoreOrders,
};
