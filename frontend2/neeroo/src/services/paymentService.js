import api from './api';

/**
 * Create Payment Order (with existing orderId)
 */
export const createPaymentOrder = async (orderId) => {
  const response = await api.post('/payment/create-order', { orderId });
  return response.data;
};

/**
 * Create Razorpay Order (without database orderId - just for payment)
 */
export const createRazorpayOrder = async (amount) => {
  const response = await api.post('/payment/create-razorpay-order', { amount });
  return response.data;
};

/**
 * Verify Payment
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

/**
 * Verify Payment Signature (standalone verification without orderId)
 */
export const verifyPaymentSignature = async (verificationData) => {
  const response = await api.post('/payment/verify-signature', verificationData);
  return response.data.verified;
};

/**
 * Handle Payment Failure
 */
export const handlePaymentFailure = async (orderId, error) => {
  try {
    const response = await api.post('/payment/failed', { orderId, error });
    return response;
  } catch (err) {
    console.error('Failed to record payment failure:', err);
  }
};

/**
 * Get Payment Status
 */
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payment/status/${orderId}`);
  return response.data;
};

const paymentService = {
  createPaymentOrder,
  createRazorpayOrder,
  verifyPayment,
  verifyPaymentSignature,
  handlePaymentFailure,
  getPaymentStatus,
};

export default paymentService;