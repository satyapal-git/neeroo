const paymentService = require('../services/payment.service');
const Order = require('../models/Order.model');
const { successResponse, errorResponse, createdResponse } = require('../utils/response.util');
const MESSAGES = require('../constants/messages.constant');
const logger = require('../utils/logger.util');

/**
 * @desc    Create Payment Order (Razorpay)
 * @route   POST /api/payment/create-order
 * @access  Private (User)
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return errorResponse(res, 'Order ID is required', 400);
    }

    // Find order
    const order = await Order.findOne({ orderId }).populate('userId', 'name mobile');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Check if user owns this order
    if (order.userId._id.toString() !== req.userId.toString()) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return errorResponse(res, 'Order already paid', 400);
    }

    // Create Razorpay order
    const razorpayOrder = await paymentService.createRazorpayOrder(
      order.total,
      order.orderId,
      {
        name: order.userId.name,
        mobile: order.userId.mobile,
      }
    );

    // Update order with razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = 'pending';
    await order.save();

    logger.info(`Payment order created for: ${orderId}`);

    return successResponse(res, 'Payment order created successfully', {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order.orderId,
      key: process.env.RAZORPAY_KEY_ID, // Send to frontend
    });

  } catch (error) {
    logger.error(`Create Payment Order Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Verify Payment
 * @route   POST /api/payment/verify
 * @access  Private (User)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return errorResponse(res, 'Missing payment verification data', 400);
    }

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Verify signature
    const isValidSignature = paymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      // Update payment status as failed
      await paymentService.updatePaymentStatus(orderId, {
        status: 'failed',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      logger.warn(`Payment verification failed for order: ${orderId}`);
      return errorResponse(res, 'Payment verification failed', 400);
    }

    // Update payment status as paid
    const updatedOrder = await paymentService.updatePaymentStatus(orderId, {
      status: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    logger.info(`Payment verified successfully for order: ${orderId}`);

    return successResponse(res, 'Payment verified successfully', {
      order: {
        orderId: updatedOrder.orderId,
        paymentStatus: updatedOrder.paymentStatus,
        paidAt: updatedOrder.paidAt,
      },
    });

  } catch (error) {
    logger.error(`Verify Payment Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Handle Payment Failure
 * @route   POST /api/payment/failed
 * @access  Private (User)
 */
const handlePaymentFailure = async (req, res, next) => {
  try {
    const { orderId, error } = req.body;

    if (!orderId) {
      return errorResponse(res, 'Order ID is required', 400);
    }

    // Update payment status as failed
    await paymentService.updatePaymentStatus(orderId, {
      status: 'failed',
      razorpayOrderId: error?.metadata?.order_id || null,
      razorpayPaymentId: error?.metadata?.payment_id || null,
    });

    logger.warn(`Payment failed for order: ${orderId} - Reason: ${error?.reason || 'Unknown'}`);

    return successResponse(res, 'Payment failure recorded', {
      orderId,
    });

  } catch (error) {
    logger.error(`Handle Payment Failure Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get Payment Status
 * @route   GET /api/payment/status/:orderId
 * @access  Private (User)
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).select('paymentStatus razorpayPaymentId paidAt');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, 'Payment status fetched', {
      orderId,
      paymentStatus: order.paymentStatus,
      razorpayPaymentId: order.razorpayPaymentId,
      paidAt: order.paidAt,
    });

  } catch (error) {
    logger.error(`Get Payment Status Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Initiate Refund (Admin)
 * @route   POST /api/payment/refund
 * @access  Private (Admin)
 */
const initiateRefund = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      return errorResponse(res, 'Order ID is required', 400);
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.paymentStatus !== 'paid') {
      return errorResponse(res, 'Order is not paid, cannot refund', 400);
    }

    if (!order.razorpayPaymentId) {
      return errorResponse(res, 'No payment ID found for this order', 400);
    }

    // Initiate refund
    const refund = await paymentService.initiateRefund(
      order.razorpayPaymentId,
      order.total,
      reason
    );

    // Update order
    order.paymentStatus = 'refunded';
    order.refundId = refund.id;
    order.refundedAt = new Date();
    await order.save();

    logger.info(`Refund initiated for order: ${orderId} - Refund ID: ${refund.id}`);

    return successResponse(res, 'Refund initiated successfully', {
      orderId,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert paise to rupees
    });

  } catch (error) {
    logger.error(`Initiate Refund Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  initiateRefund,
};