const User = require('../models/User.model');
const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Notification = require('../models/Notification.model');
const { successResponse, errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * @desc    Get User Dashboard
 * @route   GET /api/user/dashboard
 * @access  Private (User)
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user details
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get order statistics
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      readyOrders: orders.filter(o => o.status === 'ready').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    };

    // Get recent orders (last 5)
    const recentOrders = orders.slice(0, 5).map(order => ({
      _id: order._id,
      orderId: order.orderId,
      orderType: order.orderType,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    // Get active cart
    const cart = await Cart.findOne({ userId });

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      userId,
      read: false,
    });

    // Get favorite items (most ordered items)
    const favoriteItems = await Order.aggregate([
      { $match: { userId: userId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          name: { $first: '$items.name' },
          orderCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
    ]);

    return successResponse(res, 'Dashboard data fetched successfully', {
      user: {
        _id: user._id,
        mobile: user.mobile,
        name: user.name,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      stats,
      recentOrders,
      cart: cart ? {
        itemCount: cart.itemCount,
        total: cart.total,
      } : null,
      unreadNotifications,
      favoriteItems,
    });

  } catch (error) {
    logger.error(`Get User Dashboard Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Order Timeline
 * @route   GET /api/user/orders/:orderId/timeline
 * @access  Private (User)
 */
const getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.userId.toString()) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    // Build timeline
    const timeline = order.statusHistory.map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      message: getStatusMessage(history.status),
    }));

    // Add estimated completion time
    const estimatedTime = getEstimatedTime(order.status, order.createdAt);

    return successResponse(res, 'Order timeline fetched successfully', {
      orderId: order.orderId,
      currentStatus: order.status,
      timeline,
      estimatedTime,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
    });

  } catch (error) {
    logger.error(`Get Order Timeline Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get User Statistics
 * @route   GET /api/user/stats
 * @access  Private (User)
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all orders
    const orders = await Order.find({ userId });

    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue: orders.length > 0 
        ? Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length)
        : 0,
      favoriteOrderType: getFavoriteOrderType(orders),
      mostOrderedDay: getMostOrderedDay(orders),
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
      },
      monthlyStats: getMonthlyStats(orders),
    };

    return successResponse(res, 'User statistics fetched successfully', { stats });

  } catch (error) {
    logger.error(`Get User Stats Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Reorder Previous Order
 * @route   POST /api/user/orders/:orderId/reorder
 * @access  Private (User)
 */
const reorderOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('items.itemId');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.userId.toString()) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.userId);

    // Clear existing cart
    cart.clearCart();

    // Add all items from order to cart
    for (const item of order.items) {
      const menuItem = item.itemId;
      
      // Check if item still exists and is available
      if (menuItem && menuItem.isActive && menuItem.inStock) {
        cart.items.push({
          itemId: menuItem._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          portion: item.portion,
          image: menuItem.image,
        });
      }
    }

    cart.calculateTotals();
    await cart.save();

    logger.info(`Order ${order.orderId} reordered by user ${req.userId}`);

    return successResponse(res, 'Items added to cart successfully', {
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
      },
      unavailableItems: order.items.length - cart.items.length,
    });

  } catch (error) {
    logger.error(`Reorder Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

// Helper functions
const getStatusMessage = (status) => {
  const messages = {
    pending: 'Order received and awaiting preparation',
    preparing: 'Your delicious food is being prepared',
    ready: 'Your order is ready for pickup/serving',
    delivered: 'Order delivered successfully',
  };
  return messages[status] || 'Status update';
};

const getEstimatedTime = (status, createdAt) => {
  const now = new Date();
  const orderTime = new Date(createdAt);
  const elapsed = Math.floor((now - orderTime) / 60000); // minutes

  const estimates = {
    pending: { min: 5, max: 10 },
    preparing: { min: 15, max: 25 },
    ready: { min: 0, max: 5 },
    delivered: { min: 0, max: 0 },
  };

  const estimate = estimates[status];
  const remaining = Math.max(0, estimate.max - elapsed);

  return remaining > 0 ? `${remaining} minutes` : 'Ready soon';
};

const getFavoriteOrderType = (orders) => {
  const dineIn = orders.filter(o => o.orderType === 'dine-in').length;
  const takeaway = orders.filter(o => o.orderType === 'takeaway').length;
  return dineIn > takeaway ? 'dine-in' : 'takeaway';
};

const getMostOrderedDay = (orders) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = {};

  orders.forEach(order => {
    const day = days[new Date(order.createdAt).getDay()];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  return Object.keys(dayCounts).reduce((a, b) => 
    dayCounts[a] > dayCounts[b] ? a : b, 'N/A'
  );
};

const getMonthlyStats = (orders) => {
  const last6Months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleDateString('en-US', { month: 'short' });
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === month.getMonth() &&
             orderDate.getFullYear() === month.getFullYear();
    });

    last6Months.push({
      month: monthName,
      orders: monthOrders.length,
      spent: monthOrders.reduce((sum, o) => sum + o.total, 0),
    });
  }

  return last6Months;
};

module.exports = {
  getDashboard,
  getOrderTimeline,
  getUserStats,
  reorderOrder,
};