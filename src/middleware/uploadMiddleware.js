'use strict';

const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_SIZE_MB = 5;

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (_req, file, cb) => {
    const ext = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
    const mime = ALLOWED_TYPES.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    return cb(new Error('Only image files are allowed.'));
};

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter
});

module.exports = upload;
