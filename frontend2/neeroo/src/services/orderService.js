import api from './api';

export const orderService = {
  // User: Create order
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  // User: Get my orders
  getMyOrders: async () => {
    return await api.get('/orders/my-orders');
  },

  // User: Get order by ID
  getOrderById: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  // Admin: Get all orders
  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    return await api.get(`/orders?${params.toString()}`);
  },

  // Admin: Update order status
  updateOrderStatus: async (orderId, status) => {
    return await api.patch(`/orders/${orderId}/status`, { status });
  },

  // Admin: Get today's statistics
  getTodayStats: async () => {
    return await api.get('/orders/stats/today');
  },

  // Calculate order totals
  calculateOrderTotals: (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;
    
    return { subtotal, gst, total };
  },
};