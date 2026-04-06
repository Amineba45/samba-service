'use strict';

/**
 * Request validation middleware factory using Joi schemas.
 * @param {import('joi').Schema} schema - Joi schema for req.body
 */
const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message);
        return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    req.body = value;
    next();
};

module.exports = validateRequest;
