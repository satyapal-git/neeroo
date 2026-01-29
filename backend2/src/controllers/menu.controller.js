console.log("🔥 MENU.CONTROLLER.JS EXECUTED1");
const MenuItem = require('../models/MenuItem.model');
// ✅ FIX: Rename imports to avoid conflict with function names
const { uploadImage: uploadToCloudinary, deleteImage: deleteFromCloudinary } = require('../services/upload.service');
console.log("🔥 MENU.CONTROLLER.JS EXECUTED2");
const asyncHandler = require('../utils/asyncHandler.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Get all menu items
 * @route   GET /api/menu/items
 * @access  Public
 */
const getAllItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ isActive: true }).sort({ category: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

/**
 * @desc    Get items by category
 * @route   GET /api/menu/items/category/:category
 * @access  Public
 */
const getItemsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const items = await MenuItem.findByCategory(category);

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

/**
 * @desc    Get single menu item
 * @route   GET /api/menu/items/:id
 * @access  Public
 */
const getItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item || !item.isActive) {
    return res.status(404).json({
      success: false,
      message: MESSAGES.ERROR.ITEM_NOT_FOUND,
    });
  }

  res.status(200).json({
    success: true,
    data: item,
  });
});

/**
 * @desc    Add new menu item
 * @route   POST /api/menu/items
 * @access  Private (Admin)
 */
const addItem = asyncHandler(async (req, res) => {
  const { name, category, halfPrice, fullPrice, image, description, cloudinaryId } = req.body;

  // Create menu item
  const menuItem = await MenuItem.create({
    name,
    category,
    halfPrice: halfPrice || null,
    fullPrice: fullPrice || null,
    image: image || undefined,
    cloudinaryId: cloudinaryId || undefined,
    description,
    createdBy: req.admin._id,
  });

  logger.info(`Menu item created: ${menuItem._id} by admin ${req.admin._id}`);

  res.status(201).json({
    success: true,
    message: MESSAGES.SUCCESS.ITEM_CREATED,
    data: menuItem,
  });
});

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/items/:id
 * @access  Private (Admin)
 */
const updateItem = asyncHandler(async (req, res) => {
  let item = await MenuItem.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: MESSAGES.ERROR.ITEM_NOT_FOUND,
    });
  }

  // Update fields
  const { name, category, halfPrice, fullPrice, image, description, cloudinaryId } = req.body;

  if (name) item.name = name;
  if (category) item.category = category;
  if (halfPrice !== undefined) item.halfPrice = halfPrice || null;
  if (fullPrice !== undefined) item.fullPrice = fullPrice || null;
  if (image !== undefined) item.image = image;
  if (description !== undefined) item.description = description;
  if (cloudinaryId !== undefined) item.cloudinaryId = cloudinaryId;
  item.updatedBy = req.admin._id;

  await item.save();

  logger.info(`Menu item updated: ${item._id} by admin ${req.admin._id}`);

  res.status(200).json({
    success: true,
    message: MESSAGES.SUCCESS.ITEM_UPDATED,
    data: item,
  });
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/items/:id
 * @access  Private (Admin)
 */
const deleteItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: MESSAGES.ERROR.ITEM_NOT_FOUND,
    });
  }

  // Delete image from Cloudinary if exists
  if (item.cloudinaryId) {
    await deleteFromCloudinary(item.image, item.cloudinaryId);
  }

  // Soft delete
  item.isActive = false;
  await item.save();

  logger.info(`Menu item deleted: ${item._id} by admin ${req.admin._id}`);

  res.status(200).json({
    success: true,
    message: MESSAGES.SUCCESS.ITEM_DELETED,
  });
});

/**
 * @desc    Toggle stock status
 * @route   PATCH /api/menu/items/:id/stock
 * @access  Private (Admin)
 */
const toggleStock = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: MESSAGES.ERROR.ITEM_NOT_FOUND,
    });
  }

  await item.toggleStock();

  logger.info(`Stock toggled for item: ${item._id} - ${item.inStock ? 'In Stock' : 'Out of Stock'}`);

  res.status(200).json({
    success: true,
    message: item.inStock ? MESSAGES.SUCCESS.STOCK_ENABLED : MESSAGES.SUCCESS.STOCK_DISABLED,
    data: item,
  });
});

/**
 * @desc    Upload menu item image
 * @route   POST /api/menu/upload-image
 * @access  Private (Admin)
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: MESSAGES.ERROR.NO_FILE_UPLOADED,
    });
  }

  try {
    // ✅ FIX: Use renamed import
    const imageData = await uploadToCloudinary(req.file);

    res.status(200).json({
      success: true,
      message: MESSAGES.SUCCESS.IMAGE_UPLOADED,
      data: imageData,
    });
  } catch (error) {
    logger.error(`Image upload failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || MESSAGES.ERROR.UPLOAD_FAILED,
    });
  }
});

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