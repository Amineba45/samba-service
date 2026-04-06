'use strict';

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createStoreSchema, updateStoreSchema } = require('../validation/schemas');

router.post('/', authMiddleware, validateRequest(createStoreSchema), storeController.createStore);
router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.put('/:id', authMiddleware, validateRequest(updateStoreSchema), storeController.updateStore);
router.delete('/:id', authMiddleware, storeController.deleteStore);
router.get('/:id/products', storeController.getStoreProducts);

module.exports = router;
