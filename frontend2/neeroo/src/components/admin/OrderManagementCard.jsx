import { useState } from 'react';
import { formatDateTime, formatCurrency, getStatusColor } from '../../utils/helpers';
import { ORDER_STATUS } from '../../utils/constants';

const OrderManagementCard = ({ order, onUpdateStatus }) => {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`card border-l-4`} style={{ borderLeftColor: getStatusColor(order.status) }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">Order #{order.orderId}</h3>
          <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="text-xs text-gray-600">Customer</div>
          <div className="font-semibold">{order.userId?.mobile || order.userMobile}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Type</div>
          <div className="font-semibold">{order.orderType}</div>
        </div>
        {order.tableNumber && (
          <div>
            <div className="text-xs text-gray-600">Table</div>
            <div className="font-semibold">{order.tableNumber}</div>
          </div>
        )}
        <div>
          <div className="text-xs text-gray-600">Items</div>
          <div className="font-semibold">{order.items.length}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-sm">Order Items:</h4>
        <div className="flex flex-wrap gap-2">
          {order.items.map((item, idx) => (
            <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {item.name} x{item.quantity}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
        >
          <option value={ORDER_STATUS.PENDING}>Pending</option>
          <option value={ORDER_STATUS.PREPARING}>Preparing</option>
          <option value={ORDER_STATUS.READY}>Ready</option>
          <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
        </select>
        <button
          onClick={handleUpdateStatus}
          disabled={updating || status === order.status}
          className="btn-success px-6"
        >
          {updating ? 'Updating...' : 'Update'}
        </button>
      </div>

      <div className="text-right">
        <span className="text-lg font-bold text-green-600">
          Total: {formatCurrency(order.total)}
        </span>
      </div>
    </div>
  );
};

export default OrderManagementCard;