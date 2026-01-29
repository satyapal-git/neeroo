import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const useOrders = (isAdmin = false, filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // ✅ Memoized fetch function that can be called manually
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (isAdmin) {
        response = await orderService.getAllOrders(filters);
      } else {
        response = await orderService.getMyOrders();
      }
      
      // ✅ Handle response.data structure
      setOrders(response.data?.orders || response.orders || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, JSON.stringify(filters)]);

  // ✅ Memoized stats fetch
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await orderService.getTodayStats();
      // ✅ Handle response.data structure
      setStats(response.data?.stats || response.stats || null);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [isAdmin]);

  // ✅ Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchStats();
    }
  }, [fetchOrders, fetchStats, isAdmin]);

  // ✅ Auto-refresh for admin every 30 seconds
  useEffect(() => {
    if (!isAdmin) return;

    console.log('📡 Setting up auto-refresh for admin dashboard (30s interval)');
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing orders and stats...');
      fetchOrders();
      fetchStats();
    }, 30000); // 30 seconds

    return () => {
      console.log('🛑 Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [isAdmin, fetchOrders, fetchStats]);

  // ✅ Create order with auto-refetch
  const createOrder = async (orderData) => {
    try {
      const response = await orderService.createOrder(orderData);
      
      console.log('✅ Order created, refetching orders...');
      
      // ✅ Refetch orders to show the new order
      await fetchOrders();
      
      // ✅ Refetch stats if admin
      if (isAdmin) {
        await fetchStats();
      }
      
      toast.success('Order placed successfully!');
      
      // ✅ Return the created order
      return response.data?.order || response.order;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      toast.error(errorMessage);
      throw err;
    }
  };

  // ✅ Update status with auto-refetch
  const updateStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      
      console.log('✅ Order status updated, refetching...');
      
      // ✅ Optimistic update (immediate UI feedback)
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId 
            ? { ...order, status: response.data?.order?.status || response.data?.status || status } 
            : order
        )
      );
      
      // ✅ Full refetch to ensure consistency
      await fetchOrders();
      
      // ✅ Refetch stats if admin
      if (isAdmin) {
        await fetchStats();
      }
      
      toast.success('Order status updated!');
      
      return response.data || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order status';
      toast.error(errorMessage);
      
      // ✅ Rollback optimistic update on error
      await fetchOrders();
      
      throw err;
    }
  };

  // ✅ Refresh everything (manual refresh button)
  const refresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await Promise.all([
      fetchOrders(),
      isAdmin ? fetchStats() : Promise.resolve()
    ]);
  };

  return {
    orders,
    loading,
    error,
    stats,
    fetchOrders,     // ✅ Expose for manual refetch
    fetchStats,      // ✅ Expose for manual refetch
    createOrder,     // ✅ Auto-refetches after creating
    updateStatus,    // ✅ Auto-refetches after updating
    refresh,         // ✅ Manual refresh everything
  };
};