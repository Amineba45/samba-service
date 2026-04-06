'use strict';

/**
 * Strips any keys starting with '$' to prevent NoSQL injection attacks.
 * Use with { $set: sanitizeUpdateData(data) } in findByIdAndUpdate calls.
 */
const sanitizeUpdateData = (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
    const sanitized = {};
    for (const key of Object.keys(data)) {
        if (!key.startsWith('$')) {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
};

module.exports = { sanitizeUpdateData };
