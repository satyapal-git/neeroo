const MenuItem = require('../models/MenuItem.model');
const uploadService = require('../services/upload.service');
const { successResponse, errorResponse, createdResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Get All Menu Items
 * @route   GET /api/menu/items
 * @access  Public
 */
const getAllItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ isActive: true }).sort({ name: 1 });

    return successResponse(res, 'Menu items fetched successfully', {
      items,
      count: items.length,
    });

  } catch (error) {
    logger.error(`Get All Items Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Items by Category
 * @route   GET /api/menu/items/category/:category
 * @access  Public
 */
const getItemsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const items = await MenuItem.findByCategory(category, true);

    return successResponse(res, 'Menu items fetched successfully', {
      items,
      category,
      count: items.length,
    });

  } catch (error) {
    logger.error(`Get Items by Category Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Single Item
 * @route   GET /api/menu/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item || !item.isActive) {
      return errorResponse(res, MESSAGES.ERROR.ITEM_NOT_FOUND, 404);
    }

    return successResponse(res, 'Menu item fetched successfully', { item });

  } catch (error) {
    logger.error(`Get Item by ID Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Add Menu Item
 * @route   POST /api/menu/items
 * @access  Private (Admin)
 */
const addItem = async (req, res, next) => {
  try {
    const { name, category, halfPrice, fullPrice, image, description } = req.body;

    // Create menu item
    const item = await MenuItem.create({
      name,
      category,
      halfPrice: halfPrice ? parseFloat(halfPrice) : null,
      fullPrice: fullPrice ? parseFloat(fullPrice) : null,
      image: image || undefined,
      description,
      createdBy: req.adminId,
    });

    logger.info(`Menu item created: ${item.name} by admin ${req.adminId}`);

    return createdResponse(res, MESSAGES.SUCCESS.ITEM_CREATED, { item });

  } catch (error) {
    logger.error(`Add Item Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update Menu Item
 * @route   PUT /api/menu/items/:id
 * @access  Private (Admin)
 */
const updateItem = async (req, res, next) => {
  try {
    const { name, category, halfPrice, fullPrice, image, description } = req.body;

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return errorResponse(res, MESSAGES.ERROR.ITEM_NOT_FOUND, 404);
    }

    // Update fields
    if (name) item.name = name;
    if (category) item.category = category;
    if (halfPrice !== undefined) item.halfPrice = halfPrice ? parseFloat(halfPrice) : null;
    if (fullPrice !== undefined) item.fullPrice = fullPrice ? parseFloat(fullPrice) : null;
    if (image) item.image = image;
    if (description !== undefined) item.description = description;
    
    item.updatedBy = req.adminId;

    await item.save();

    logger.info(`Menu item updated: ${item.name} by admin ${req.adminId}`);

    return successResponse(res, MESSAGES.SUCCESS.ITEM_UPDATED, { item });

  } catch (error) {
    logger.error(`Update Item Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete Menu Item
 * @route   DELETE /api/menu/items/:id
 * @access  Private (Admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return errorResponse(res, MESSAGES.ERROR.ITEM_NOT_FOUND, 404);
    }

    // Soft delete (mark as inactive)
    item.isActive = false;
    await item.save();

    // Or hard delete
    // await item.deleteOne();

    logger.info(`Menu item deleted: ${item.name} by admin ${req.adminId}`);

    return successResponse(res, MESSAGES.SUCCESS.ITEM_DELETED);

  } catch (error) {
    logger.error(`Delete Item Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Toggle Stock Status
 * @route   PATCH /api/menu/items/:id/stock
 * @access  Private (Admin)
 */
const toggleStock = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return errorResponse(res, MESSAGES.ERROR.ITEM_NOT_FOUND, 404);
    }

    await item.toggleStock();

    logger.info(`Stock toggled for ${item.name}: ${item.inStock} by admin ${req.adminId}`);

    return successResponse(res, MESSAGES.SUCCESS.STOCK_UPDATED, {
      item,
      inStock: item.inStock,
    });

  } catch (error) {
    logger.error(`Toggle Stock Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Upload Menu Item Image
 * @route   POST /api/menu/upload-image
 * @access  Private (Admin)
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload an image', 400);
    }

    // Validate file
    uploadService.validateImageFile(req.file);

    // Upload image
    const result = await uploadService.uploadImage(req.file);

    logger.info(`Image uploaded by admin ${req.adminId}`);

    return successResponse(res, 'Image uploaded successfully', {
      url: result.url,
      publicId: result.publicId,
    });

  } catch (error) {
    logger.error(`Upload Image Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllItems,
  getItemsByCategory,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  toggleStock,
  uploadImage,
};