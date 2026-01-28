const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { protectAdmin } = require('../middlewares/admin.middleware');
const { validate } = require('../middlewares/validation.middleware');

/**
 * @route   POST /api/orders
 * @desc    Create order (User)
 * @access  Private (User)
 */
router.post(
  '/',
  protect,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.itemId')
      .optional()
      .isMongoId()
      .withMessage('Invalid item ID'),
    body('items.*.name')
      .trim()
      .notEmpty()
      .withMessage('Item name is required'),
    body('items.*.price')
      .isFloat({ min: 0 })
      .withMessage('Item price must be a positive number'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Item quantity must be at least 1'),
    body('items.*.portion')
      .isIn(['half', 'full', 'single'])
      .withMessage('Invalid portion type'),
    body('orderType')
      .trim()
      .isIn(['dine-in', 'takeaway'])
      .withMessage('Order type must be either dine-in or takeaway'),
    body('tableNumber')
      .if(body('orderType').equals('dine-in'))
      .trim()
      .notEmpty()
      .withMessage('Table number is required for dine-in orders'),
  ],
  validate,
  orderController.createOrder
);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get user orders
 * @access  Private (User)
 */
router.get('/my-orders', protect, orderController.getMyOrders);

/**
 * @route   GET /api/orders/stats/today
 * @desc    Get today's statistics (Admin)
 * @access  Private (Admin)
 */
router.get('/stats/today', protectAdmin, orderController.getTodayStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (User/Admin)
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Private (Admin)
 */
router.get('/', protectAdmin, orderController.getAllOrders);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status (Admin)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  protectAdmin,
  [
    body('status')
      .trim()
      .isIn(['pending', 'preparing', 'ready', 'delivered'])
      .withMessage('Invalid order status'),
  ],
  validate,
  orderController.updateOrderStatus
);

module.exports = router;