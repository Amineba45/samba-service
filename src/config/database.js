'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/samba_service';

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB error:', err);
  });
};

module.exports = connectDB;