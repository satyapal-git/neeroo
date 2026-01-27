import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const useOrders = (isAdmin = false, filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, JSON.stringify(filters)]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (isAdmin) {
        data = await orderService.getAllOrders(filters);
      } else {
        data = await orderService.getMyOrders();
      }
      
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await orderService.getTodayStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const data = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      return data.order;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const data = await orderService.updateOrderStatus(orderId, status);
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: data.status } : order
        )
      );
      toast.success('Order status updated!');
      
      // Refresh stats if admin
      if (isAdmin) {
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    stats,
    fetchOrders,
    createOrder,
    updateStatus,
  };
};