'use strict';

const multer = require('multer');
const path = require('path');
const { APP_ERROR_CODES, HTTP_STATUS } = require('../../constants/errorCodes');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Use memory storage so files can be streamed to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only JPEG, PNG and WebP images are allowed'), {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorCode: APP_ERROR_CODES.INVALID_FILE_TYPE,
      }),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
