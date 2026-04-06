'use strict';

const mongoose = require('mongoose');
const Product = require('../models/Product');
const logger = require('../config/logger');
const { sanitizeUpdateData } = require('../utils/validators');

const ALLOWED_STATUSES = ['active', 'inactive', 'out_of_stock'];

const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, discountPrice, category, store, stock, images, status } = req.body;

        const product = await Product.create({ name, description, price, discountPrice, category, store, stock, images, status });
        logger.info(`Product created: ${product._id}`);
        res.status(201).json({ success: true, message: 'Product created', product });
    } catch (err) {
        next(err);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const filter = {};

        if (req.query.store) {
            filter.store = new mongoose.Types.ObjectId(req.query.store);
        }
        if (req.query.category) {
            filter.category = new mongoose.Types.ObjectId(req.query.category);
        }

        // Break taint chain: use Array.find() against whitelist for enum params
        if (req.query.status) {
            const validStatus = ALLOWED_STATUSES.find((s) => s === req.query.status);
            if (validStatus) {
                filter.status = validStatus;
            }
        } else {
            filter.status = 'active';
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('store', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: products.length, products });
    } catch (err) {
        next(err);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(new mongoose.Types.ObjectId(req.params.id))
            .populate('category', 'name')
            .populate('store', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'description', 'price', 'discountPrice', 'category', 'stock', 'images', 'status'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        const sanitized = sanitizeUpdateData(updates);
        const product = await Product.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.params.id),
            { $set: sanitized },
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        logger.info(`Product updated: ${product._id}`);
        res.json({ success: true, message: 'Product updated', product });
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        logger.info(`Product deleted: ${req.params.id}`);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
