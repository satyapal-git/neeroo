import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';
import OrderManagementCard from '../../components/admin/OrderManagementCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useNotifications } from '../../hooks/useNotifications';
import { formatCurrency } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { orders, loading, stats, updateStatus, fetchOrders } = useOrders(true, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <div className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="font-semibold">{user?.restaurantId}</p>
              <p className="text-sm text-gray-600">{user?.mobile}</p>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon="📋"
              label="Total Orders"
              value={stats?.totalOrders || orders.length}
              color="blue"
            />
            <StatsCard
              icon="⏳"
              label="Pending"
              value={stats?.pendingOrders || orders.filter(o => o.status === ORDER_STATUS.PENDING).length}
              color="yellow"
            />
            <StatsCard
              icon="👨‍🍳"
              label="Preparing"
              value={stats?.preparingOrders || orders.filter(o => o.status === ORDER_STATUS.PREPARING).length}
              color="blue"
            />
            <StatsCard
              icon="💰"
              label="Today's Revenue"
              value={formatCurrency(stats?.todayRevenue || 0)}
              color="green"
            />
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <div className="flex gap-2 flex-wrap">
                {['all', ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      statusFilter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner text="Loading orders..." />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No {statusFilter !== 'all' ? statusFilter : ''} orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderManagementCard
                    key={order._id}
                    order={order}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;