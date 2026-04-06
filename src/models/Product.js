'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:          { type: String, required: true, trim: true },
    description:   { type: String, trim: true },
    price:         { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    store:         { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    images:        [{ type: String }],
    stock:         { type: Number, default: 0, min: 0 },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    sold:          { type: Number, default: 0 },
    tags:          [{ type: String, trim: true }],
    status:        { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
