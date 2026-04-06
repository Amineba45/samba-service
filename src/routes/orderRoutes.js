'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createOrderSchema } = require('../validation/schemas');

// All order routes require authentication
router.use(authMiddleware);

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/store/:storeId', orderController.getStoreOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/track', orderController.trackOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
