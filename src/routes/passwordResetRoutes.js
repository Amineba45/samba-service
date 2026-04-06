'use strict';

const express = require('express');
const router = express.Router();

const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');
const { validateBody } = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validation/schemas');

/**
 * @swagger
 * tags:
 *   name: Password Reset
 *   description: Password reset endpoints
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent (if email exists)
 */
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Password Reset]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmPassword]
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);

module.exports = router;
