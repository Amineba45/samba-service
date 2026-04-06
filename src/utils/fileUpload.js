'use strict';

const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../config/logger');

/**
 * Upload a single file (buffer from multer) to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional Cloudinary options
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadImage = async (buffer, folder = 'samba-service', options = {}) => {
  const result = await uploadToCloudinary(buffer, {
    folder,
    resource_type: 'image',
    ...options,
  });
  logger.info(`Image uploaded: ${result.public_id}`);
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await deleteFromCloudinary(publicId);
    logger.info(`Image deleted: ${publicId}`);
  } catch (err) {
    logger.warn(`Failed to delete image ${publicId}: ${err.message}`);
  }
};

/**
 * Upload multiple images
 * @param {Buffer[]} buffers
 * @param {string} folder
 */
const uploadMultipleImages = async (buffers, folder = 'samba-service') => {
  return Promise.all(buffers.map((buf) => uploadImage(buf, folder)));
};

module.exports = { uploadImage, deleteImage, uploadMultipleImages };
