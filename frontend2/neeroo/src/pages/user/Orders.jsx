import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import OrderCard from '../../components/user/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useOrders } from '../../hooks/useOrders';

const Orders = () => {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useOrders(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="card mb-6">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 text-primary-600 font-semibold hover:underline mb-4"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            📋 My Orders
          </h1>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your orders..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Orders Yet!</h2>
            <p className="text-gray-600 mb-6">Start exploring our delicious menu</p>
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;