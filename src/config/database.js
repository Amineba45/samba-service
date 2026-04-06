'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        logger.error('MONGODB_URI environment variable is not set.');
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        logger.info('MongoDB connected successfully.');
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
});

module.exports = connectDB;