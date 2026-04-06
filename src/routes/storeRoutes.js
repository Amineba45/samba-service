'use strict';

const express = require('express');
const router = express.Router();

const {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  uploadStoreLogo,
  getMyStores,
} = require('../controllers/storeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const { createStoreSchema, updateStoreSchema } = require('../validation/schemas');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Store management endpoints
 */

router.get('/my', protect, getMyStores);
router.get('/', getStores);
router.post('/', protect, restrictTo('seller', 'admin'), validateBody(createStoreSchema), createStore);
router.get('/:id', getStoreById);
router.patch('/:id', protect, validateBody(updateStoreSchema), updateStore);
router.delete('/:id', protect, deleteStore);
router.post('/:id/logo', protect, upload.single('logo'), uploadStoreLogo);

module.exports = router;
