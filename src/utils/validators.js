'use strict';

const mongoose = require('mongoose');

/**
 * Remove any keys starting with '$' to prevent NoSQL injection.
 */
const sanitizeUpdateData = (data) => {
    if (!data || typeof data !== 'object') return {};
    return Object.keys(data).reduce((acc, key) => {
        if (!key.startsWith('$')) {
            acc[key] = data[key];
        }
        return acc;
    }, {});
};

/**
 * Validate and cast a string to a Mongoose ObjectId.
 * Returns a new ObjectId instance or throws a TypeError.
 */
const toObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error(`Invalid ID: ${id}`);
        err.status = 400;
        throw err;
    }
    return new mongoose.Types.ObjectId(id);
};

module.exports = { sanitizeUpdateData, toObjectId };
