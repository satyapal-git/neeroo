const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

/**
 * @route   GET /api/cart
 * @desc    Get user cart
 * @access  Private (User)
 */
router.get('/', protect, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private (User)
 */
router.post(
  '/items',
  protect,
  [
    body('itemId')
      .trim()
      .notEmpty()
      .withMessage('Item ID is required')
      .isMongoId()
      .withMessage('Invalid item ID'),
    body('portion')
      .trim()
      .isIn(['half', 'full', 'single'])
      .withMessage('Invalid portion type'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validate,
  cartController.addToCart
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private (User)
 */
router.put(
  '/items/:itemId',
  protect,
  [
    param('itemId')
      .isMongoId()
      .withMessage('Invalid item ID'),
    body('portion')
      .trim()
      .isIn(['half', 'full', 'single'])
      .withMessage('Invalid portion type'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a positive number'),
  ],
  validate,
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (User)
 */
router.delete(
  '/items/:itemId',
  protect,
  [
    param('itemId')
      .isMongoId()
      .withMessage('Invalid item ID'),
  ],
  validate,
  cartController.removeFromCart
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private (User)
 */
router.delete('/', protect, cartController.clearCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Sync cart from frontend
 * @access  Private (User)
 */
router.post(
  '/sync',
  protect,
  [
    body('items')
      .isArray()
      .withMessage('Items must be an array'),
  ],
  validate,
  cartController.syncCart
);

module.exports = router;