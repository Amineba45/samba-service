'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true
    },
    comment: {
        type: String,
        trim: true
    },
    images: [{
        type: String
    }],
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
