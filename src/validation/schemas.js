'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).max(128).required(),
    phone: Joi.string().trim().min(7).max(20).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
});

const createStoreSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(5).max(255).required(),
    email: Joi.string().email().lowercase().required(),
    phone: Joi.string().trim().min(7).max(20).required()
});

const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(2000).optional(),
    price: Joi.number().positive().required(),
    discountPrice: Joi.number().positive().optional(),
    category: Joi.string().hex().length(24).optional(),
    store: Joi.string().hex().length(24).required(),
    stock: Joi.number().integer().min(0).default(0),
    images: Joi.array().items(Joi.string().uri()).optional(),
    status: Joi.string().valid('active', 'inactive', 'out_of_stock').optional()
});

const createOrderSchema = Joi.object({
    store: Joi.string().hex().length(24).required(),
    products: Joi.array().items(
        Joi.object({
            product: Joi.string().hex().length(24).required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required(),
    deliveryAddress: Joi.string().trim().min(5).max(255).required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'mobile_money').default('cash')
});

const passwordResetRequestSchema = Joi.object({
    email: Joi.string().email().lowercase().required()
});

const passwordResetSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(128).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    createStoreSchema,
    createProductSchema,
    createOrderSchema,
    passwordResetRequestSchema,
    passwordResetSchema
};
