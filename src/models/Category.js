'use strict';

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Regenerate slug whenever name is modified
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
