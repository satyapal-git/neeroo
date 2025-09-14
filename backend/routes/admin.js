const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOTP } = require('../utils/otpService');

const router = express.Router();

// JWT Secret for admin
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-2024';

// Generate admin JWT token
const generateAdminToken = (adminId) => {
  return jwt.sign({ adminId, type: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '24h' });
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin account deactivated'
      });
    }

    req.admin = { id: admin._id, username: admin.username, role: admin.role };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   POST /api/admin/send-otp
// @desc    Send OTP to admin mobile
// @access  Public
router.post('/send-otp', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('mobile')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, mobile } = req.body;

    // Find admin by username and mobile
    const admin = await Admin.findOne({ 
      username: username.toLowerCase(), 
      mobile, 
      isActive: true 
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed attempts'
      });
    }

    // Generate and save OTP
    const otp = admin.generateOTP();
    await admin.save();

    // Send OTP
    const otpSent = await sendOTP(mobile, otp);
    
    if (!otpSent.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        username: admin.username,
        mobile: admin.mobile,
        expiresIn: 10
      }
    });

  } catch (error) {
    console.error('Admin Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   POST /api/admin/verify-otp
// @desc    Verify admin OTP and login
// @access  Public
router.post('/verify-otp', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, otp } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Find admin
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify OTP
    const verification = admin.verifyOTP(otp);
    if (!verification.success) {
      await admin.incrementLoginAttempts();
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Log successful login
    admin.logActivity('login', 'Successful OTP login', clientIP);
    await admin.save();

    // Generate token
    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          mobile: admin.mobile,
          role: admin.role,
          permissions: admin.permissions,
          profile: admin.profile
        }
      }
    });

  } catch (error) {
    console.error('Admin Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get statistics
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      todayOrders,
      todayRevenue,
      totalUsers,
      popularItems
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $in: ['delivered', 'ready'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      User.countDocuments({ status: 'active' }),
      Order.getPopularItems(5)
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalOrders,
          pendingOrders,
          preparingOrders,
          todayOrders,
          todayRevenue: todayRevenue[0]?.total || 0,
          totalUsers
        },
        popularItems,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private (Admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      orderType, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { userMobile: { $regex: search, $options: 'i' } },
        { tableNumber: { $regex: search, $options: 'i' } }
      ];
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
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/orders/:orderId/status', [
  adminAuth,
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus(status, req.admin.username, notes);

    // Log admin activity
    const admin = await Admin.findById(req.admin.id);
    admin.logActivity('order_updated', `Updated order ${orderId} to ${status}`, req.ip);
    await admin.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/admin/orders/:orderId
// @desc    Get specific order details
// @access  Private (Admin)
router.get('/orders/:orderId', adminAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('userId', 'mobile profile loyaltyPoints');

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
    console.error('Get Order Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status = 'active' } = req.query;

    const query = { status };
    
    if (search) {
      query.$or = [
        { mobile: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } },
        { 'profile.email': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-otp')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderHistory', 'orderId status createdAt pricing.total');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue reports
// @access  Private (Admin)
router.get('/reports/revenue', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get revenue statistics
    const revenueStats = await Order.getRevenueStats(start, end);
    
    // Get daily/weekly/monthly breakdown based on groupBy
    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'week':
        groupFormat = { $week: "$createdAt" };
        break;
      case 'month':
        groupFormat = { $month: "$createdAt" };
        break;
      default:
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const revenueBreakdown = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['delivered', 'ready'] }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: revenueStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
        breakdown: revenueBreakdown,
        period: { startDate: start, endDate: end, groupBy }
      }
    });

  } catch (error) {
    console.error('Revenue Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private (Admin)
router.post('/logout', adminAuth, async (req, res) => {
  try {
    // Log logout activity
    const admin = await Admin.findById(req.admin.id);
    admin.logActivity('logout', 'Admin logout', req.ip);
    await admin.save();

    res.json({
      success: true,
      message: 'Admin logged out successfully'
    });

  } catch (error) {
    console.error('Admin Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

module.exports = router;