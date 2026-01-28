const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const menuController = require('../controllers/menu.controller');
const { protectAdmin } = require('../middlewares/admin.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { upload, handleUploadError } = require('../middlewares/upload.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter.middleware');

/**
 * @route   GET /api/menu/items
 * @desc    Get all menu items
 * @access  Public
 */
router.get('/items', menuController.getAllItems);

/**
 * @route   GET /api/menu/items/category/:category
 * @desc    Get items by category
 * @access  Public
 */
router.get(
  '/items/category/:category',
  [
    param('category')
      .isIn([
        'indian', 'raita', 'salad', 'rice', 'toast',
        'tawe', 'tandoor', 'drinksSnacks', 'snacks',
        'pasta', 'chinese', 'beverage'
      ])
      .withMessage('Invalid category'),
  ],
  validate,
  menuController.getItemsByCategory
);

/**
 * @route   GET /api/menu/items/:id
 * @desc    Get single menu item
 * @access  Public
 */
router.get('/items/:id', menuController.getItemById);

/**
 * @route   POST /api/menu/items
 * @desc    Add menu item (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/items',
  protectAdmin,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Item name is required')
      .isLength({ max: 100 })
      .withMessage('Item name cannot exceed 100 characters'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn([
        'indian', 'raita', 'salad', 'rice', 'toast',
        'tawe', 'tandoor', 'drinksSnacks', 'snacks',
        'pasta', 'chinese', 'beverage'
      ])
      .withMessage('Invalid category'),
    body('halfPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Half price must be a positive number'),
    body('fullPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Full price must be a positive number'),
    body('image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image must be a valid URL'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  validate,
  menuController.addItem
);

/**
 * @route   PUT /api/menu/items/:id
 * @desc    Update menu item (Admin only)
 * @access  Private (Admin)
 */
router.put(
  '/items/:id',
  protectAdmin,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Item name must be between 1 and 100 characters'),
    body('category')
      .optional()
      .trim()
      .isIn([
        'indian', 'raita', 'salad', 'rice', 'toast',
        'tawe', 'tandoor', 'drinksSnacks', 'snacks',
        'pasta', 'chinese', 'beverage'
      ])
      .withMessage('Invalid category'),
    body('halfPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Half price must be a positive number'),
    body('fullPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Full price must be a positive number'),
    body('image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image must be a valid URL'),
  ],
  validate,
  menuController.updateItem
);

/**
 * @route   DELETE /api/menu/items/:id
 * @desc    Delete menu item (Admin only)
 * @access  Private (Admin)
 */
router.delete('/items/:id', protectAdmin, menuController.deleteItem);

/**
 * @route   PATCH /api/menu/items/:id/stock
 * @desc    Toggle stock status (Admin only)
 * @access  Private (Admin)
 */
router.patch('/items/:id/stock', protectAdmin, menuController.toggleStock);

/**
 * @route   POST /api/menu/upload-image
 * @desc    Upload menu item image (Admin only)
 * @access  Private (Admin)
 */
router.post(
  '/upload-image',
  protectAdmin,
  uploadLimiter,
  upload.single('image'),
  handleUploadError,
  menuController.uploadImage
);

module.exports = router;