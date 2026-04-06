'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/samba-service';
        await mongoose.connect(uri);
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('MongoDB connection error:', { message: error.message });
        process.exit(1);
    }
};

module.exports = connectDB;
