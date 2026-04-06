'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = authMiddleware;
const upload = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { updateProfileSchema } = require('../validation/schemas');

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', userController.getUserProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateUserProfile);
router.post('/upload-picture', upload.single('picture'), userController.uploadProfilePicture);

// Admin-only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
