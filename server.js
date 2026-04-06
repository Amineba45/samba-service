require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
