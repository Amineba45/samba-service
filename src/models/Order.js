'use strict';

const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHODS = ['card', 'cash_on_delivery', 'bank_transfer'];

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         buyer:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *         totalAmount:
 *           type: number
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must have a buyer'],
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Order must be associated with a store'],
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true },
      zipCode: { type: String },
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'cash_on_delivery',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String, trim: true },
    cancelledAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
