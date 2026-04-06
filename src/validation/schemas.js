'use strict';

const Joi = require('joi');

// ─── Auth ────────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().trim().optional(),
  role: Joi.string().valid('user', 'seller').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

// ─── User ────────────────────────────────────────────────────────────────────

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(50).optional(),
  lastName: Joi.string().trim().max(50).optional(),
  phone: Joi.string().trim().optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match new password',
  }),
});

// ─── Store ───────────────────────────────────────────────────────────────────

const createStoreSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }).optional(),
  contact: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    website: Joi.string().uri().optional(),
  }).optional(),
});

const updateStoreSchema = createStoreSchema.fork(
  ['name'],
  (schema) => schema.optional()
);

// ─── Product ─────────────────────────────────────────────────────────────────

const createProductSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).optional(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().length(24).hex().required(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  attributes: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
  isFeatured: Joi.boolean().optional(),
});

const updateProductSchema = createProductSchema.fork(
  ['name', 'price', 'stock', 'category'],
  (schema) => schema.optional()
);

// ─── Category ────────────────────────────────────────────────────────────────

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  parent: Joi.string().length(24).hex().optional().allow(null),
  order: Joi.number().integer().optional(),
});

const updateCategorySchema = createCategorySchema.fork(
  ['name'],
  (schema) => schema.optional()
);

// ─── Order ───────────────────────────────────────────────────────────────────

const createOrderSchema = Joi.object({
  store: Joi.string().length(24).hex().required(),
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().length(24).hex().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().optional(),
    country: Joi.string().required(),
    zipCode: Joi.string().optional(),
  }).required(),
  paymentMethod: Joi.string().valid('card', 'cash_on_delivery', 'bank_transfer').optional(),
  notes: Joi.string().trim().optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    .required(),
});

// ─── Review ──────────────────────────────────────────────────────────────────

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).optional(),
});

// ─── Password Reset ──────────────────────────────────────────────────────────

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createStoreSchema,
  updateStoreSchema,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createReviewSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
