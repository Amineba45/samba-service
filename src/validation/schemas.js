'use strict';

const Joi = require('joi');

const password = Joi.string().min(8).max(72).required()
    .messages({ 'string.min': 'Password must be at least 8 characters.' });

exports.registerSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName:  Joi.string().trim().min(1).max(50).required(),
    email:     Joi.string().email().lowercase().required(),
    password,
    phone:     Joi.string().trim().max(20).optional()
});

exports.loginSchema = Joi.object({
    email:    Joi.string().email().lowercase().required(),
    password: Joi.string().required()
});

exports.refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

exports.createStoreSchema = Joi.object({
    name:        Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    address:     Joi.string().trim().required(),
    email:       Joi.string().email().lowercase().required(),
    phone:       Joi.string().trim().max(20).required(),
    logoUrl:     Joi.string().uri().optional(),
    bannerUrl:   Joi.string().uri().optional()
});

exports.updateStoreSchema = Joi.object({
    name:        Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    address:     Joi.string().trim().optional(),
    email:       Joi.string().email().lowercase().optional(),
    phone:       Joi.string().trim().max(20).optional(),
    logoUrl:     Joi.string().uri().optional(),
    bannerUrl:   Joi.string().uri().optional()
});

exports.createProductSchema = Joi.object({
    name:          Joi.string().trim().min(1).max(200).required(),
    description:   Joi.string().trim().max(2000).optional(),
    price:         Joi.number().positive().required(),
    discountPrice: Joi.number().positive().optional(),
    category:      Joi.string().required(),
    store:         Joi.string().required(),
    images:        Joi.array().items(Joi.string()).optional(),
    stock:         Joi.number().integer().min(0).default(0),
    tags:          Joi.array().items(Joi.string()).optional()
});

exports.createOrderSchema = Joi.object({
    store:           Joi.string().required(),
    products:        Joi.array().items(Joi.object({
        productId: Joi.string().required(),
        quantity:  Joi.number().integer().min(1).required()
    })).min(1).required(),
    deliveryAddress: Joi.string().trim().required(),
    paymentMethod:   Joi.string().optional(),
    notes:           Joi.string().trim().max(500).optional()
});

exports.updateProfileSchema = Joi.object({
    firstName:      Joi.string().trim().min(1).max(50).optional(),
    lastName:       Joi.string().trim().min(1).max(50).optional(),
    phone:          Joi.string().trim().max(20).optional(),
    profilePicture: Joi.string().uri().optional()
});

exports.passwordResetRequestSchema = Joi.object({
    email: Joi.string().email().lowercase().required()
});

exports.passwordResetSchema = Joi.object({
    token:    Joi.string().required(),
    password
});
