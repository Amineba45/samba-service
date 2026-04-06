const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { asyncHandler } = require('../middleware/errorHandler');
const { ORDER_STATUS } = require('../utils/constants');

const getOrders = asyncHandler(async (req, res) => {
  const { storeId, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'customer') {
    query.customerId = req.user._id;
  } else if (req.user.role === 'store_admin') {
    query.storeId = req.user.storeId;
  }

  if (storeId && req.user.role === 'super_admin') {
    if (!mongoose.Types.ObjectId.isValid(String(storeId))) {
      return res.status(400).json({ success: false, message: 'Invalid storeId' });
    }
    query.storeId = new mongoose.Types.ObjectId(String(storeId));
  }
  if (status) {
    if (!ORDER_STATUS.includes(String(status))) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    query.orderStatus = String(status);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('storeId', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.json({ success: true, count: orders.length, total, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customerId', 'firstName lastName email phone')
    .populate('storeId', 'name address phone')
    .populate('items.productId', 'name images');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  const { storeId, items, deliveryAddress, latitude, longitude, paymentMethod, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(String(storeId))) {
    return res.status(400).json({ success: false, message: 'Invalid storeId' });
  }

  const store = await Store.findById(new mongoose.Types.ObjectId(String(storeId)));
  if (!store || store.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Store not available' });
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(String(item.productId))) {
      return res.status(400).json({ success: false, message: `Invalid productId: ${item.productId}` });
    }
    const product = await Product.findById(new mongoose.Types.ObjectId(String(item.productId)));
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${item.productId} not available` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }
    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;
    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal
    });

    // Reduce stock
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
  }

  const finalAmount = totalAmount + store.deliveryFee;

  const order = await Order.create({
    storeId,
    customerId: req.user._id,
    items: orderItems,
    deliveryAddress,
    latitude,
    longitude,
    totalAmount,
    deliveryFee: store.deliveryFee,
    finalAmount,
    paymentMethod,
    notes
  });

  res.status(201).json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  if (!ORDER_STATUS.includes(String(orderStatus))) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: String(orderStatus), ...(orderStatus === 'delivered' ? { actualDeliveryTime: new Date() } : {}) },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus };
