const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger.util');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testConnection = async () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('⚠️ Cloudinary not configured. Using local storage.');
    return false;
  }

  try {
    await cloudinary.api.ping();
    logger.info('✅ Cloudinary connected successfully');
    return true;
  } catch (error) {
    logger.error(`❌ Cloudinary connection failed: ${error.message}`);
    return false;
  }
};

// Upload options
const uploadOptions = {
  folder: 'taj-restaurant/menu-items',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    { width: 800, height: 600, crop: 'limit' },
    { quality: 'auto' },
    { fetch_format: 'auto' },
  ],
};

module.exports = {
  cloudinary,
  testConnection,
  uploadOptions,
};