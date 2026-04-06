'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { createOrderSchema } = require('../validation/schemas');

router.post('/', apiLimiter, authMiddleware, validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', apiLimiter, authMiddleware, requireRole('admin', 'seller'), orderController.getOrders);
router.get('/user/my-orders', apiLimiter, authMiddleware, orderController.getUserOrders);
router.get('/:id', apiLimiter, authMiddleware, orderController.getOrderById);
router.put('/:id/status', apiLimiter, authMiddleware, requireRole('admin', 'seller'), orderController.updateOrderStatus);
router.put('/:id/cancel', apiLimiter, authMiddleware, orderController.cancelOrder);

module.exports = router;
