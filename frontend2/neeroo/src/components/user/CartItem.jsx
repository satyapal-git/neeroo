import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency, getImageUrl } from '../../utils/helpers';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.itemKey, item.quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.itemKey, item.quantity - 1);
  };

  const handleRemove = () => {
    removeFromCart(item.itemKey);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-all border border-gray-200">
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        className="w-20 h-20 rounded-lg object-cover"
      />
      
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
        <p className="text-gray-600 text-sm">{formatCurrency(item.price)} each</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
        >
          <Minus size={16} />
        </button>
        <span className="text-lg font-bold min-w-6 text-center">{item.quantity}</span>
        <button
          onClick={handleIncrement}
          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="text-right min-w-24">
        <div className="font-bold text-lg text-primary-600">
          {formatCurrency(itemTotal)}
        </div>
      </div>

      <button
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 transition-colors p-2"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default CartItem;