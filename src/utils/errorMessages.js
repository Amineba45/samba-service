'use strict';

const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  TOKEN_INVALID: 'Invalid authentication token',
  NOT_AUTHENTICATED: 'You are not logged in. Please log in to get access',
  NOT_AUTHORIZED: 'You do not have permission to perform this action',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact support',

  // User
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  INVALID_PASSWORD: 'Current password is incorrect',

  // Store
  STORE_NOT_FOUND: 'Store not found',
  STORE_ALREADY_EXISTS: 'A store with this name already exists',
  NOT_STORE_OWNER: 'You are not the owner of this store',

  // Product
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient stock available',

  // Category
  CATEGORY_NOT_FOUND: 'Category not found',

  // Order
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_CANNOT_BE_CANCELLED: 'This order cannot be cancelled in its current status',

  // Cart
  CART_NOT_FOUND: 'Cart not found',
  CART_ITEM_NOT_FOUND: 'Item not found in cart',

  // Review
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this product',

  // File
  FILE_TOO_LARGE: 'File size exceeds the allowed limit (5MB)',
  INVALID_FILE_TYPE: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed',

  // Validation
  VALIDATION_ERROR: 'Validation error',

  // General
  INTERNAL_ERROR: 'An internal server error occurred',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  RESOURCE_NOT_FOUND: 'The requested resource was not found',
};

module.exports = ERROR_MESSAGES;
