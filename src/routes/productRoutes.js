'use strict';

const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductReviews,
  createProductReview,
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const {
  createProductSchema,
  updateProductSchema,
  createReviewSchema,
} = require('../validation/schemas');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

router.get('/', getProducts);
router.post('/', protect, restrictTo('seller', 'admin'), upload.array('images', 5), validateBody(createProductSchema), createProduct);
router.get('/:id', getProductById);
router.patch('/:id', protect, validateBody(updateProductSchema), updateProduct);
router.delete('/:id', protect, deleteProduct);

// Reviews sub-resource
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, validateBody(createReviewSchema), createProductReview);

module.exports = router;
