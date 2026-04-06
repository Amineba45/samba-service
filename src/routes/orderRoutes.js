'use strict';

const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getStoreOrders,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const { createOrderSchema, updateOrderStatusSchema } = require('../validation/schemas');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

router.get('/my', protect, getMyOrders);
router.post('/', protect, validateBody(createOrderSchema), createOrder);
router.get('/store/:storeId', protect, restrictTo('seller', 'admin'), getStoreOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, restrictTo('seller', 'admin'), validateBody(updateOrderStatusSchema), updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;
