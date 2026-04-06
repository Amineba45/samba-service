const mongoose = require('mongoose');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const { sanitizeUpdateData } = require('../utils/validators');

const getProducts = asyncHandler(async (req, res) => {
  const { storeId, categoryId, search, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };

  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(String(storeId))) {
      return res.status(400).json({ success: false, message: 'Invalid storeId' });
    }
    query.storeId = new mongoose.Types.ObjectId(String(storeId));
  }
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(String(categoryId))) {
      return res.status(400).json({ success: false, message: 'Invalid categoryId' });
    }
    query.categoryId = new mongoose.Types.ObjectId(String(categoryId));
  }
  if (search) query.$text = { $search: String(search) };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(query).populate('categoryId', 'name').skip(skip).limit(parseInt(limit)),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    page: parseInt(page),
    data: products
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId storeId');
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(String(req.params.id))) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }
  const sanitized = sanitizeUpdateData(req.body);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: sanitized }, { new: true, runValidators: true });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
