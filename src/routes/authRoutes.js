'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validation/schemas');

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);

module.exports = router;
