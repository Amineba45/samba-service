'use strict';

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { createProductSchema } = require('../validation/schemas');

router.post('/', apiLimiter, authMiddleware, validateRequest(createProductSchema), productController.createProduct);
router.get('/', apiLimiter, productController.getProducts);
router.get('/:id', apiLimiter, productController.getProductById);
router.put('/:id', apiLimiter, authMiddleware, productController.updateProduct);
router.delete('/:id', apiLimiter, authMiddleware, productController.deleteProduct);

module.exports = router;
