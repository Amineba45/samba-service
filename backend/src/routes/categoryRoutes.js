const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeUpdateData } = require('../utils/validators');

router.get('/', asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  const query = { isActive: true };
  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(String(storeId))) {
      return res.status(400).json({ success: false, message: 'Invalid storeId' });
    }
    query.storeId = new mongoose.Types.ObjectId(String(storeId));
  }
  const categories = await Category.find(query).sort({ displayOrder: 1 });
  res.json({ success: true, count: categories.length, data: categories });
}));

router.post('/', protect, authorize('store_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
}));

router.put('/:id', protect, authorize('store_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const sanitized = sanitizeUpdateData(req.body);
  const category = await Category.findByIdAndUpdate(req.params.id, { $set: sanitized }, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

router.delete('/:id', protect, authorize('store_admin', 'super_admin'), asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
}));

module.exports = router;
