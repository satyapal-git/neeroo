const razorpayInstance = require('../config/razorpay.config');
const crypto = require('crypto');
const Order = require('../models/Order.model');
const logger = require('../utils/logger.util');

/**
 * Create Razorpay order
 */
const createRazorpayOrder = async (amount, orderId, customerInfo) => {
  try {
    console.log("🔥 RAZORPAY ENV KEYS:");
    console.log("🔥 KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("🔥 KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "EXISTS" : "MISSING ❌");
    console.log("🔥 Amount:", amount, "-> Paise:", Math.round(amount * 100));
    console.log("🔥 OrderId:", orderId);

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: orderId.slice(-8), // Max 8 characters allowed by Razorpay
      notes: {
        orderId: orderId,
        customerName: customerInfo.name || 'Guest',
        customerMobile: customerInfo.mobile || '',
      },
    };

    console.log("🔥 Razorpay options:", JSON.stringify(options));

    const razorpayOrder = await razorpayInstance.orders.create(options);
    
    console.log("🔥 Razorpay order created:", razorpayOrder.id);
    logger.info(`Razorpay order created: ${razorpayOrder.id} for order: ${orderId}`);
    
    return razorpayOrder;
  } catch (error) {
    // Print FULL error so we can see what Razorpay is returning
    console.error("❌ RAZORPAY FULL ERROR:", JSON.stringify(error));
    console.error("❌ RAZORPAY ERROR MESSAGE:", error.message);
    console.error("❌ RAZORPAY ERROR RESPONSE:", error.response?.data || error.response);
    logger.error(`Razorpay order creation error: ${error.message}`);
    // Throw actual error message, not generic one
    throw new Error(error.message || 'Failed to create payment order');
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    logger.error(`Payment verification error: ${error.message}`);
    return false;
  }
};

/**
 * Update payment status in order
 */
const updatePaymentStatus = async (orderId, paymentData) => {
  try {
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = paymentData.status;
    order.razorpayOrderId = paymentData.razorpayOrderId;
    order.razorpayPaymentId = paymentData.razorpayPaymentId;
    order.razorpaySignature = paymentData.razorpaySignature;
    order.paidAt = paymentData.status === 'paid' ? new Date() : null;

    await order.save();
    
    logger.info(`Payment status updated for order: ${orderId} - Status: ${paymentData.status}`);
    
    return order;
  } catch (error) {
    logger.error(`Update payment status error: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch payment details from Razorpay
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error(`Fetch payment details error: ${error.message}`);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Initiate refund
 */
const initiateRefund = async (paymentId, amount, reason) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
      notes: {
        reason: reason || 'Order cancellation',
      },
    });
    
    logger.info(`Refund initiated for payment: ${paymentId}`);
    return refund;
  } catch (error) {
    logger.error(`Refund initiation error: ${error.message}`);
    throw new Error('Failed to initiate refund');
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  updatePaymentStatus,
  fetchPaymentDetails,
  initiateRefund,
};