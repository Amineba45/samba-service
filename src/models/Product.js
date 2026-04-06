'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    images: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
