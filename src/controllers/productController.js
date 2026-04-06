'use strict';

const Product = require('../models/Product');
const { sanitizeUpdateData, toObjectId } = require('../utils/validators');

/** POST /api/products */
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

/** GET /api/products */
exports.getProducts = async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;

        const filter = { status: 'active' };

        if (req.query.category) {
            try { filter.category = toObjectId(req.query.category); } catch (_) { /* ignore */ }
        }
        if (req.query.store) {
            try { filter.store = toObjectId(req.query.store); } catch (_) { /* ignore */ }
        }
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            const minP = parseFloat(req.query.minPrice);
            const maxP = parseFloat(req.query.maxPrice);
            if (!isNaN(minP)) filter.price.$gte = minP;
            if (!isNaN(maxP)) filter.price.$lte = maxP;
        }
        if (req.query.minRating) {
            const r = parseFloat(req.query.minRating);
            if (!isNaN(r)) filter.rating = { $gte: r };
        }

        const allowedSorts = ['price', '-price', 'rating', '-rating', 'createdAt', '-createdAt', 'sold', '-sold'];
        const sortParam = allowedSorts.find((v) => v === req.query.sort) || '-createdAt';
        const sortObj = sortParam.startsWith('-')
            ? { [sortParam.slice(1)]: -1 }
            : { [sortParam]: 1 };

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(limit).populate('category', 'name slug').populate('store', 'name'),
            Product.countDocuments(filter)
        ]);
        res.json({ success: true, products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** GET /api/products/search */
exports.searchProducts = async (req, res, next) => {
    try {
        const q = String(req.query.q || '').trim();
        if (!q) return res.json({ success: true, products: [] });
        const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip  = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find({ $text: { $search: q }, status: 'active' }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } }).skip(skip).limit(limit),
            Product.countDocuments({ $text: { $search: q }, status: 'active' })
        ]);
        res.json({ success: true, products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};

/** GET /api/products/:id */
exports.getProductById = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const product = await Product.findById(id)
            .populate('category', 'name slug')
            .populate('store', 'name email phone');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

/** PUT /api/products/:id */
exports.updateProduct = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const sanitized = sanitizeUpdateData(req.body);
        const product = await Product.findByIdAndUpdate(id, { $set: sanitized }, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

/** DELETE /api/products/:id */
exports.deleteProduct = async (req, res, next) => {
    try {
        const id = toObjectId(req.params.id);
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        next(err);
    }
};
