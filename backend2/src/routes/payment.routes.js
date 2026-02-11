const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { protectAdmin } = require('../middlewares/admin.middleware');

// User routes (protected)
router.post('/create-order', protect, paymentController.createPaymentOrder);
router.post('/create-razorpay-order', protect, paymentController.createRazorpayOrderOnly); // NEW
router.post('/verify', protect, paymentController.verifyPayment);
router.post('/verify-signature', protect, paymentController.verifyPaymentSignatureOnly); // NEW
router.post('/failed', protect, paymentController.handlePaymentFailure);
router.get('/status/:orderId', protect, paymentController.getPaymentStatus);

// Admin routes (protected)
router.post('/refund', protectAdmin, paymentController.initiateRefund);

module.exports = router;