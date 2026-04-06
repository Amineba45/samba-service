'use strict';

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { createStoreSchema } = require('../validation/schemas');

router.post('/', apiLimiter, authMiddleware, validateRequest(createStoreSchema), storeController.createStore);
router.get('/', apiLimiter, storeController.getStores);
router.get('/:id', apiLimiter, storeController.getStoreById);
router.put('/:id', apiLimiter, authMiddleware, storeController.updateStore);
router.delete('/:id', apiLimiter, authMiddleware, storeController.deleteStore);

module.exports = router;
