const { cloudinary, uploadOptions } = require('../config/cloudinary.config');
const logger = require('../utils/logger.util');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload Image to Cloudinary
 */
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    // Delete local file after upload
    await fs.unlink(filePath);
    
    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };

  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw new Error('Failed to upload image to cloud storage');
  }
};

/**
 * Delete Image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return { success: false, message: 'No public ID provided' };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return result;

  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw new Error('Failed to delete image from cloud storage');
  }
};

/**
 * Upload Image (Local or Cloud)
 */
const uploadImage = async (file) => {
  try {
    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME;

    if (useCloudinary) {
      // Upload to Cloudinary
      return await uploadToCloudinary(file.path);
    } else {
      // Use local storage
      const fileName = `${Date.now()}-${file.originalname}`;
      const uploadPath = path.join('uploads', 'menu-items', fileName);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });
      
      // Move file to uploads directory
      await fs.rename(file.path, uploadPath);
      
      logger.info(`Image saved locally: ${uploadPath}`);
      
      return {
        url: `/uploads/menu-items/${fileName}`,
        publicId: null,
      };
    }

  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete Image (Local or Cloud)
 */
const deleteImage = async (imageUrl, publicId) => {
  try {
    if (publicId) {
      // Delete from Cloudinary
      return await deleteFromCloudinary(publicId);
    } else if (imageUrl && imageUrl.startsWith('/uploads/')) {
      // Delete from local storage
      const filePath = path.join(__dirname, '..', '..', imageUrl);
      await fs.unlink(filePath);
      logger.info(`Local image deleted: ${filePath}`);
      return { success: true };
    }
    
    return { success: false, message: 'No image to delete' };

  } catch (error) {
    logger.error(`Delete image error: ${error.message}`);
    // Don't throw error, just log it
    return { success: false, error: error.message };
  }
};

/**
 * Validate Image File
 */
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  return true;
};

/**
 * Get Image URL
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Local image URL
  return `${process.env.API_BASE_URL || 'http://localhost:5000'}${imagePath}`;
};

module.exports = {
  uploadImage,
  deleteImage,
  uploadToCloudinary,
  deleteFromCloudinary,
  validateImageFile,
  getImageUrl,
};