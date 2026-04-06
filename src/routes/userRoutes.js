'use strict';

const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deactivateAccount,
  getAllUsers,
  getUserById,
  deleteUser,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const { updateProfileSchema, changePasswordSchema } = require('../validation/schemas');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// ─── Current user routes ─────────────────────────────────────────────────────
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.patch('/change-password', protect, validateBody(changePasswordSchema), changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/account', protect, deactivateAccount);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/:id', protect, restrictTo('admin'), getUserById);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

module.exports = router;
