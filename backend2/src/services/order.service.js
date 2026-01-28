const Order = require('../models/Order.model');
const Admin = require('../models/Admin.model');
const { calculateGST, calculateTotal } = require('../utils/helpers.util');
const { notifyAdminNewOrder, notifyUserOrderUpdate } = require('./notification.service');
const logger = require('../utils/logger.util');

/**
 * Create Order
 */
const createOrder = async (orderData, userId, userMobile) => {
  try {
    // Calculate totals
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const gst = calculateGST(subtotal);
    const total = calculateTotal(subtotal);

    // Generate unique order ID
    const orderId = await Order.generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      userId,
      userMobile,
      items: orderData.items,
      orderType: orderData.orderType,
      tableNumber: orderData.tableNumber || null,
      subtotal,
      gst,
      total,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
        },
      ],
    });

    logger.info(`Order created: ${orderId}`);

    // Notify admin about new order (fire and forget)
    const admin = await Admin.findOne({ isActive: true });
    if (admin) {
      notifyAdminNewOrder(order, admin._id).catch(err => 
        logger.error(`Failed to notify admin: ${err.message}`)
      );
    }

    return order;

  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    throw error;
  }
};

/**
 * Get Order by ID
 */
const getOrderById = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('userId', 'name mobile')
      .populate('items.itemId', 'name image');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;

  } catch (error) {
    logger.error(`Error fetching order: ${error.message}`);
    throw error;
  }
};

/**
 * Get User Orders
 */
const getUserOrders = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.itemId', 'name image');

    return orders;

  } catch (error) {
    logger.error(`Error fetching user orders: ${error.message}`);
    throw error;
  }
};

/**
 * Get All Orders (Admin)
 */
const getAllOrders = async (filters = {}) => {
  try {
    const query = {};

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Date filter
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name mobile')
      .populate('items.itemId', 'name image');

    return orders;

  } catch (error) {
    logger.error(`Error fetching all orders: ${error.message}`);
    throw error;
  }
};

/**
 * Update Order Status
 */
const updateOrderStatus = async (orderId, newStatus, adminId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Update status
    await order.updateStatus(newStatus, adminId);

    logger.info(`Order ${order.orderId} status updated to ${newStatus}`);

    // Notify user about status change (fire and forget)
    notifyUserOrderUpdate(order).catch(err =>
      logger.error(`Failed to notify user: ${err.message}`)
    );

    return order;

  } catch (error) {
    logger.error(`Error updating order status: ${error.message}`);
    throw error;
  }
};

/**
 * Get Today's Statistics
 */
const getTodayStats = async () => {
  try {
    const stats = await Order.getStatistics();
    return stats;

  } catch (error) {
    logger.error(`Error fetching today's stats: ${error.message}`);
    throw error;
  }
};

/**
 * Get Orders by Date Range
 */
const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name mobile');

    return orders;

  } catch (error) {
    logger.error(`Error fetching orders by date range: ${error.message}`);
    throw error;
  }
};

/**
 * Get Popular Items
 */
const getPopularItems = async (limit = 10) => {
  try {
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          name: { $first: '$items.name' },
          totalOrders: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: limit },
    ]);

    return popularItems;

  } catch (error) {
    logger.error(`Error fetching popular items: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getTodayStats,
  getOrdersByDateRange,
  getPopularItems,
};