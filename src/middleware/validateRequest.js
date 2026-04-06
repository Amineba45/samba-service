'use strict';

const { HTTP_STATUS, APP_ERROR_CODES } = require('../../constants/errorCodes');
const { sendError } = require('../utils/responseHandler');

/**
 * Create a middleware that validates req.body against a Joi schema
 * @param {import('joi').Schema} schema
 * @returns {import('express').RequestHandler}
 */
const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('. ');
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST, APP_ERROR_CODES.VALIDATION_ERROR);
  }

  req.body = value;
  next();
};

/**
 * Create a middleware that validates req.query against a Joi schema
 * @param {import('joi').Schema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('. ');
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST, APP_ERROR_CODES.VALIDATION_ERROR);
  }

  req.query = value;
  next();
};

module.exports = { validateBody, validateQuery };
