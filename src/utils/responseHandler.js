'use strict';

const { HTTP_STATUS } = require('../../constants/errorCodes');

/**
 * Send a successful response
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Send a paginated list response
 */
const sendPaginatedSuccess = (res, data, pagination, message = 'Success') => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Send an error response
 */
const sendError = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = null) => {
  const response = {
    success: false,
    message,
  };

  if (errorCode) {
    response.errorCode = errorCode;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendCreated, sendPaginatedSuccess, sendError };
