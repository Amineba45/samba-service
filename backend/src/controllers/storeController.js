const Store = require('../models/Store');
const { asyncHandler } = require('../middleware/errorHandler');
const { STORE_STATUS } = require('../utils/constants');
const { sanitizeUpdateData } = require('../utils/validators');

// @desc    Get all stores
// @route   GET /api/v1/stores
// @access  Public
const getStores = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, status = 'active' } = req.query;

  if (!STORE_STATUS.includes(String(status))) {
    return res.status(400).json({ success: false, message: 'Invalid store status' });
  }

  const query = { status: String(status) };

  const stores = await Store.find(query).populate('adminId', 'firstName lastName email');

  let filteredStores = stores.map(store => store.toObject());
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    filteredStores = filteredStores
      .map(store => ({
        ...store,
        distance: Math.round(calculateDistance(userLat, userLng, store.latitude, store.longitude) * 10) / 10
      }))
      .filter(store => store.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);
  }

  res.json({ success: true, count: filteredStores.length, data: filteredStores });
});

// @desc    Get single store
// @route   GET /api/v1/stores/:id
// @access  Public
const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('adminId', 'firstName lastName email');
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }
  res.json({ success: true, data: store });
});

// @desc    Create store
// @route   POST /api/v1/stores
// @access  Private (SuperAdmin)
const createStore = asyncHandler(async (req, res) => {
  const store = await Store.create({ ...req.body, adminId: req.body.adminId || req.user._id });
  res.status(201).json({ success: true, data: store });
});

// @desc    Update store
// @route   PUT /api/v1/stores/:id
// @access  Private (Admin/SuperAdmin)
const updateStore = asyncHandler(async (req, res) => {
  let store = await Store.findById(req.params.id);
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }

  if (req.user.role !== 'super_admin' && store.adminId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this store' });
  }

  const sanitized = sanitizeUpdateData(req.body);
  store = await Store.findByIdAndUpdate(req.params.id, { $set: sanitized }, { new: true, runValidators: true });
  res.json({ success: true, data: store });
});

// @desc    Delete store
// @route   DELETE /api/v1/stores/:id
// @access  Private (SuperAdmin)
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found' });
  }
  await store.deleteOne();
  res.json({ success: true, message: 'Store deleted successfully' });
});

// Helper: calculate distance in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = { getStores, getStore, createStore, updateStore, deleteStore };
