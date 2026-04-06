'use strict';

const Store = require('../models/Store');
const Product = require('../models/Product');
const { sanitizeUpdateData, toObjectId } = require('../utils/validators');

/** POST /api/stores */
exports.createStore = async (req, res, next) => {
    try {
        const store = await Store.create({ ...req.body, owner: req.user._id });
        res.status(201).json({ success: true, store });
    } catch (err) {
        next(err);
    }
};

/** GET /api/stores */
exports.getAllStores = async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;

        const filter = {};
        const allowedStatuses = ['active', 'inactive', 'suspended'];
        if (req.query.status) {
            const s = allowedStatuses.find((v) => v === req.query.status);
            if (s) filter.status = s;
        }

        const [stores, total] = await Promise.all([
            Store.find(filter).populate('owner', 'firstName lastName email').skip(skip).limit(limit),
            Store.countDocuments(filter)
        ]);
        res.json({ success: true, stores, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** GET /api/stores/:id */
exports.getStoreById = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const store = await Store.findById(id).populate('owner', 'firstName lastName email');
        if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
        res.json({ success: true, store });
    } catch (err) {
        next(err);
    }
};

/** PUT /api/stores/:id */
exports.updateStore = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const existing = await Store.findById(id);
        if (!existing) return res.status(404).json({ success: false, message: 'Store not found.' });
        if (String(existing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        const sanitized = sanitizeUpdateData(req.body);
        const store = await Store.findByIdAndUpdate(id, { $set: sanitized }, { new: true, runValidators: true });
        res.json({ success: true, store });
    } catch (err) {
        next(err);
    }
};

/** DELETE /api/stores/:id */
exports.deleteStore = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const existing = await Store.findById(id);
        if (!existing) return res.status(404).json({ success: false, message: 'Store not found.' });
        if (String(existing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        await Store.findByIdAndDelete(id);
        res.json({ success: true, message: 'Store deleted.' });
    } catch (err) {
        next(err);
    }
};

/** GET /api/stores/:id/products */
exports.getStoreProducts = async (req, res, next) => {
    try {
        const storeId = toObjectId(req.params.id);
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find({ store: storeId, status: 'active' }).skip(skip).limit(limit),
            Product.countDocuments({ store: storeId, status: 'active' })
        ]);
        res.json({ success: true, products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};
