'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/profile', apiLimiter, authMiddleware, userController.getUserProfile);
router.put('/profile', apiLimiter, authMiddleware, userController.updateUserProfile);
router.get('/', apiLimiter, authMiddleware, requireRole('admin'), userController.getAllUsers);
router.delete('/:id', apiLimiter, authMiddleware, requireRole('admin'), userController.deleteUser);

module.exports = router;
