import api from './api';

/**
 * Create Payment Order
 */
export const createPaymentOrder = async (orderId) => {
  const response = await api.post('/payment/create-order', { orderId });
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
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
};

export default paymentService;