'use strict';

const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'samba-service', ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
