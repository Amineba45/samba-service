'use strict';

const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    store:           { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    products:        [orderProductSchema],
    totalPrice:      { type: Number, required: true, min: 0 },
    status:          {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: { type: String, required: true },
    paymentMethod:   { type: String, default: 'cash' },
    paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    notes:           { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
