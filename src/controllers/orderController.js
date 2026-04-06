'use strict';

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../config/logger');
const { sanitizeUpdateData } = require('../utils/validators');

const ALLOWED_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const createOrder = async (req, res, next) => {
    try {
        const { store, products, deliveryAddress, paymentMethod } = req.body;

        // Fetch all products in a single query to avoid N+1 and validate stock
        const productIds = products.map((item) => new mongoose.Types.ObjectId(item.product));
        const productDocs = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]));

        let totalPrice = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = productMap.get(String(item.product));
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
            }
            const unitPrice = product.discountPrice || product.price;
            totalPrice += unitPrice * item.quantity;
            orderProducts.push({ product: product._id, quantity: item.quantity, price: unitPrice });
        }

        const order = await Order.create({
            user: req.user.id,
            store,
            products: orderProducts,
            totalPrice,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cash'
        });

        logger.info(`Order created: ${order._id}`);
        res.status(201).json({ success: true, message: 'Order created', order });
    } catch (err) {
        next(err);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('store', 'name')
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        next(err);
    }
};

const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: new mongoose.Types.ObjectId(req.user.id) })
            .populate('store', 'name')
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        next(err);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(new mongoose.Types.ObjectId(req.params.id))
            .populate('user', 'firstName lastName email')
            .populate('store', 'name')
            .populate('products.product', 'name price');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatus = ALLOWED_STATUSES.find((s) => s === status);
        if (!validStatus) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const sanitized = sanitizeUpdateData({ status: validStatus });
        const order = await Order.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.params.id),
            { $set: sanitized },
            { new: true, runValidators: true }
        );
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        logger.info(`Order status updated: ${order._id} -> ${validStatus}`);
        res.json({ success: true, message: 'Order status updated', order });
    } catch (err) {
        next(err);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(new mongoose.Types.ObjectId(req.params.id));
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.status === 'delivered') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
        }
        order.status = 'cancelled';
        await order.save();
        logger.info(`Order cancelled: ${order._id}`);
        res.json({ success: true, message: 'Order cancelled', order });
    } catch (err) {
        next(err);
    }
};

module.exports = { createOrder, getOrders, getUserOrders, getOrderById, updateOrderStatus, cancelOrder };
