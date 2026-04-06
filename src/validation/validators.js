'use strict';

const mongoose = require('mongoose');

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Sanitize update data by removing any keys that start with '$'
 * to prevent NoSQL injection attacks.
 * @param {object} data - Raw update payload
 * @returns {object} Sanitized data
 */
const sanitizeUpdateData = (data) => {
  if (!data || typeof data !== 'object') return {};
  return Object.keys(data).reduce((acc, key) => {
    if (!key.startsWith('$')) {
      const value = data[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = sanitizeUpdateData(value);
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
};

/**
 * Build a pagination object from query parameters
 * @param {object} query - Express request query
 * @returns {{ page: number, limit: number, skip: number }}
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a standard pagination result object
 * @param {number} total - Total document count
 * @param {number} page
 * @param {number} limit
 * @returns {object}
 */
const buildPaginationResult = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = {
  isValidObjectId,
  sanitizeUpdateData,
  getPagination,
  buildPaginationResult,
};
