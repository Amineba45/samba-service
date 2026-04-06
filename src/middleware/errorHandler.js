'use strict';

const logger = require('../config/logger');

/**
 * Global error handling middleware.
 * Must be registered AFTER all routes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ success: false, message: `Duplicate value for ${field}.` });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid value for ${err.path}.` });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'File too large.' });
    }

    // Generic HTTP errors with status
    const status = err.status || err.statusCode || 500;
    const message = (status < 500 ? err.message : null) || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
