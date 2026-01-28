const orderService = require('../services/order.service');
const Cart = require('../models/Cart.model');
const { successResponse, errorResponse, createdResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Create Order
 * @route   POST /api/orders
 * @access  Private (User)
 */
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const userId = req.userId;
    const userMobile = req.user.mobile;

    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      return errorResponse(res, MESSAGES.VALIDATION.ITEMS_REQUIRED, 400);
    }

    // Create order
    const order = await orderService.createOrder(orderData, userId, userMobile);

    // Clear user's cart after successful order
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.clearCart();
      await cart.save();
    }

    logger.info(`Order created: ${order.orderId} by user ${userId}`);

    return createdResponse(res, MESSAGES.SUCCESS.ORDER_CREATED, {
      order: {
        _id: order._id,
        orderId: order.orderId,
        items: order.items,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        subtotal: order.subtotal,
        gst: order.gst,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });

  } catch (error) {
    logger.error(`Create Order Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get My Orders
 * @route   GET /api/orders/my-orders
 * @access  Private (User)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.userId);

    return successResponse(res, 'Orders fetched successfully', {
      orders,
      count: orders.length,
    });

  } catch (error) {
    logger.error(`Get My Orders Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    // Check if user owns this order (for user role)
    if (req.userId && order.userId.toString() !== req.userId.toString()) {
      return errorResponse(res, MESSAGES.ERROR.FORBIDDEN, 403);
    }

    return successResponse(res, 'Order fetched successfully', { order });

  } catch (error) {
    logger.error(`Get Order by ID Error: ${error.message}`);
    
    if (error.message === 'Order not found') {
      return errorResponse(res, MESSAGES.ERROR.ORDER_NOT_FOUND, 404);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get All Orders (Admin)
 * @route   GET /api/orders
 * @access  Private (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      date: req.query.date,
    };

    const orders = await orderService.getAllOrders(filters);

    return successResponse(res, 'Orders fetched successfully', {
      orders,
      count: orders.length,
      filters,
    });

  } catch (error) {
    logger.error(`Get All Orders Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update Order Status
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, MESSAGES.VALIDATION.STATUS_REQUIRED, 400);
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      req.adminId
    );

    logger.info(`Order ${order.orderId} status updated to ${status} by admin ${req.adminId}`);

    return successResponse(res, MESSAGES.SUCCESS.ORDER_UPDATED, {
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
      },
    });

  } catch (error) {
    logger.error(`Update Order Status Error: ${error.message}`);
    
    if (error.message === 'Order not found') {
      return errorResponse(res, MESSAGES.ERROR.ORDER_NOT_FOUND, 404);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Today's Statistics
 * @route   GET /api/orders/stats/today
 * @access  Private (Admin)
 */
const getTodayStats = async (req, res, next) => {
  try {
    const stats = await orderService.getTodayStats();

    return successResponse(res, 'Statistics fetched successfully', { stats });

  } catch (error) {
    logger.error(`Get Today Stats Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getTodayStats,
};