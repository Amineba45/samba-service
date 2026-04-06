'use strict';

const mongoose = require('mongoose');
const Store = require('../models/Store');
const logger = require('../config/logger');
const { sanitizeUpdateData } = require('../utils/validators');

const createStore = async (req, res, next) => {
    try {
        const { name, address, email, phone } = req.body;

        const existing = await Store.findOne({ email: String(email) });
        if (existing) {
            return res.status(409).json({ success: false, message: 'A store with this email already exists' });
        }

        const store = await Store.create({ name, address, email, phone, owner: req.user.id });
        logger.info(`Store created: ${store._id}`);
        res.status(201).json({ success: true, message: 'Store created', store });
    } catch (err) {
        next(err);
    }
};

const getStores = async (req, res, next) => {
    try {
        const stores = await Store.find({ status: 'active' })
            .populate('owner', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: stores.length, stores });
    } catch (err) {
        next(err);
    }
};

const getStoreById = async (req, res, next) => {
    try {
        const store = await Store.findById(new mongoose.Types.ObjectId(req.params.id))
            .populate('owner', 'firstName lastName email');
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        res.json({ success: true, store });
    } catch (err) {
        next(err);
    }
};

const updateStore = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'address', 'email', 'phone', 'status'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        const sanitized = sanitizeUpdateData(updates);
        const store = await Store.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.params.id),
            { $set: sanitized },
            { new: true, runValidators: true }
        );
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        logger.info(`Store updated: ${store._id}`);
        res.json({ success: true, message: 'Store updated', store });
    } catch (err) {
        next(err);
    }
};

const deleteStore = async (req, res, next) => {
    try {
        const store = await Store.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        logger.info(`Store deleted: ${req.params.id}`);
        res.json({ success: true, message: 'Store deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { createStore, getStores, getStoreById, updateStore, deleteStore };
