const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/user/dashboard
 * @desc    Get user dashboard data
 * @access  Private (User)
 */
router.get('/dashboard', protect, userController.getDashboard);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private (User)
 */
router.get('/stats', protect, userController.getUserStats);

/**
 * @route   GET /api/user/orders/:orderId/timeline
 * @desc    Get order timeline
 * @access  Private (User)
 */
router.get('/orders/:orderId/timeline', protect, userController.getOrderTimeline);

/**
 * @route   POST /api/user/orders/:orderId/reorder
 * @desc    Reorder previous order
 * @access  Private (User)
 */
router.post('/orders/:orderId/reorder', protect, userController.reorderOrder);

module.exports = router;