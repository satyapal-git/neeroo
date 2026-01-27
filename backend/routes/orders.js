const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  authMiddleware,
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.itemId')
    .notEmpty()
    .withMessage('Item ID is required'),
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
  body('orderType')
    .isIn(['dine-in', 'takeaway'])
    .withMessage('Order type must be either dine-in or takeaway'),
  body('tableNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Table number cannot be empty if provided')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, orderType, tableNumber, specialRequests, loyaltyPointsUsed = 0 } = req.body;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate table number for dine-in orders
    if (orderType === 'dine-in' && !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Table number is required for dine-in orders'
      });
    }

    // Validate loyalty points usage
    if (loyaltyPointsUsed > 0 && loyaltyPointsUsed > user.loyaltyPoints.available) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient loyalty points'
      });
    }

    // Create new order
    const order = new Order({
      userId: user._id,
      userMobile: user.mobile,
      items: items.map(item => ({
        ...item,
        category: item.category || 'maincourse' // default category
      })),
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      specialRequests,
      pricing: {
        loyaltyPointsUsed
      }
    });

    // Calculate estimated time
    order.calculateEstimatedTime();

    // Save order
    await order.save();

    // Use loyalty points if specified
    if (loyaltyPointsUsed > 0) {
      const pointsUsage = user.useLoyaltyPoints(loyaltyPointsUsed);
      if (pointsUsage.success) {
        await user.save();
      }
    }

    // Add loyalty points for this order (1 point per ₹10)
    const pointsEarned = user.addLoyaltyPoints(order.pricing.total);
    
    // Add order to user's history
    user.orderHistory.push(order._id);
    await user.save();

    // Populate order for response
    await order.populate('userId', 'mobile profile');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        loyaltyPointsEarned: pointsEarned,
        estimatedTime: order.estimatedTime
      }
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'mobile profile');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get specific order details
// @access  Private
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id
    }).populate('userId', 'mobile profile');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Cancel the order
    await order.updateStatus('cancelled', `User: ${order.userMobile}`, 'Cancelled by user');

    // Refund loyalty points if used
    if (order.pricing.loyaltyPointsUsed > 0) {
      const user = await User.findById(req.user.id);
      user.loyaltyPoints.available += order.pricing.loyaltyPointsUsed;
      user.loyaltyPoints.used -= order.pricing.loyaltyPointsUsed;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   POST /api/orders/:orderId/feedback
// @desc    Add feedback to an order
// @access  Private
router.post('/:orderId/feedback', [
  authMiddleware,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be added to delivered orders'
      });
    }

    // Check if feedback already exists
    if (order.customerFeedback && order.customerFeedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this order'
      });
    }

    // Add feedback
    await order.addFeedback(rating, comment);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback: order.customerFeedback
      }
    });

  } catch (error) {
    console.error('Add Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   POST /api/orders/:orderId/reorder
// @desc    Reorder items from a previous order
// @access  Private
router.post('/:orderId/reorder', authMiddleware, async (req, res) => {
  try {
    const originalOrder = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id
    });

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: 'Original order not found'
      });
    }

    const { orderType = 'takeaway', tableNumber, specialRequests } = req.body;

    // Get user
    const user = await User.findById(req.user.id);

    // Create new order with same items
    const newOrder = new Order({
      userId: user._id,
      userMobile: user.mobile,
      items: originalOrder.items,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      specialRequests
    });

    // Calculate estimated time
    newOrder.calculateEstimatedTime();

    // Save order
    await newOrder.save();

    // Add loyalty points
    const pointsEarned = user.addLoyaltyPoints(newOrder.pricing.total);
    
    // Add order to user's history
    user.orderHistory.push(newOrder._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Reorder placed successfully',
      data: {
        order: newOrder,
        loyaltyPointsEarned: pointsEarned
      }
    });

  } catch (error) {
    console.error('Reorder Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get user's order statistics
// @access  Private
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get order statistics
    const [totalOrders, totalSpent, favoriteItems] = await Promise.all([
      Order.countDocuments({ userId }),
      Order.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.itemId',
            name: { $first: '$items.name' },
            count: { $sum: '$items.quantity' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        favoriteItems,
        averageOrderValue: totalOrders > 0 ? Math.round((totalSpent[0]?.total || 0) / totalOrders) : 0
      }
    });

  } catch (error) {
    console.error('Get Order Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

module.exports = router;