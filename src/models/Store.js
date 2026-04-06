'use strict';

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    address:     { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    phone:       { type: String, required: true, trim: true },
    logoUrl:     { type: String },
    bannerUrl:   { type: String },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status:      { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
