'use strict';

const Order = require('../models/Order');
const Product = require('../models/Product');
const { toObjectId } = require('../utils/validators');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

/** POST /api/orders */
exports.createOrder = async (req, res, next) => {
    try {
        const { store, products, deliveryAddress, paymentMethod, notes } = req.body;
        // Resolve product prices
        const productDocs = await Product.find({
            _id: { $in: products.map((p) => toObjectId(p.productId)) }
        });
        const productMap = new Map(productDocs.map((p) => [String(p._id), p]));
        let totalPrice = 0;
        const orderProducts = products.map((item) => {
            const doc = productMap.get(String(item.productId));
            if (!doc) throw Object.assign(new Error(`Product ${item.productId} not found.`), { status: 404 });
            const price = doc.discountPrice || doc.price;
            totalPrice += price * item.quantity;
            return { productId: toObjectId(item.productId), quantity: item.quantity, price };
        });
        const order = await Order.create({
            user: req.user._id,
            store: toObjectId(store),
            products: orderProducts,
            totalPrice,
            deliveryAddress,
            paymentMethod,
            notes
        });
        res.status(201).json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/ (current user's orders) */
exports.getUserOrders = async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments({ user: req.user._id })
        ]);
        res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/store/:storeId (seller) */
exports.getStoreOrders = async (req, res, next) => {
    try {
        const storeId = toObjectId(req.params.storeId);
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({ store: storeId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'firstName lastName email'),
            Order.countDocuments({ store: storeId })
        ]);
        res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/:id */
exports.getOrderById = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const order = await Order.findById(id).populate('user', 'firstName lastName email').populate('store', 'name');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        // Only allow owner, store seller, or admin
        if (String(order.user._id || order.user) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

/** PUT /api/orders/:id/status */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const status = VALID_STATUSES.find((v) => v === req.body.status);
        if (!status) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }
        const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

/** PUT /api/orders/:id/cancel */
exports.cancelOrder = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
        }
        order.status = 'cancelled';
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/:id/track */
exports.trackOrder = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const order = await Order.findById(id).select('status createdAt updatedAt deliveryAddress');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        res.json({ success: true, status: order.status, updatedAt: order.updatedAt, createdAt: order.createdAt });
    } catch (err) {
        next(err);
    }
};