'use strict';

const logger = require('../config/logger');

/**
 * Global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
    logger.error(err.message || 'Unexpected error', { stack: err.stack });

    // Joi validation errors
    if (err.name === 'ValidationError' && err.isJoi) {
        return res.status(400).json({
            success: false,
            message: err.details ? err.details.map((d) => d.message).join(', ') : err.message
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message: messages });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
