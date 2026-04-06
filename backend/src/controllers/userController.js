const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { USER_ROLES } = require('../utils/constants');
const { sanitizeUpdateData } = require('../utils/validators');

const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) {
    if (!USER_ROLES.includes(String(role))) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    query.role = String(role);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  res.json({ success: true, count: users.length, total, data: users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { password, role, ...rawUpdateData } = req.body;
  const updateData = sanitizeUpdateData(rawUpdateData);
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { password, role, ...rawUpdateData } = req.body;
  const updateData = sanitizeUpdateData(rawUpdateData);
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true, runValidators: true });
  res.json({ success: true, data: user });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { getUsers, getUser, updateUser, deleteUser, updateProfile, getProfile };
