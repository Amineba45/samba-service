'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

/**
 * Verifies the Bearer JWT token and attaches decoded user to req.user.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(err);
    }
};

/**
 * Restricts access to users with one of the allowed roles.
 * Must be used after authMiddleware.
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
