import { formatDateTime, formatCurrency, getStatusColor, getStatusText, capitalizeFirst } from '../../utils/helpers';

const OrderCard = ({ order }) => {
  return (
    <div className="card border-l-4 hover:shadow-2xl transition-all" style={{ borderLeftColor: getStatusColor(order.status) }}>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Order #{order.orderId || order._id}</h3>
          <p className="text-sm text-gray-600">{formatDateTime(order.createdAt || order.timestamp)}</p>
        </div>
        <span className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full font-semibold`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Order Type</div>
          <div className="font-bold">{capitalizeFirst(order.orderType)}</div>
        </div>
        {order.tableNumber && (
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Table</div>
            <div className="font-bold">{order.tableNumber}</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Items</div>
          <div className="font-bold">{order.items.length}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Total</div>
          <div className="font-bold text-green-600">{formatCurrency(order.total)}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Order Items:</h4>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600">x{item.quantity}</span>
              <span className="font-bold text-primary-600">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>GST (5%):</span>
          <span>{formatCurrency(order.gst)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-white border-opacity-30 font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;