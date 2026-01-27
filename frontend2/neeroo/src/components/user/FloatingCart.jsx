import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';

const FloatingCart = () => {
  const navigate = useNavigate();
  const { getCartCount, getCartTotal } = useCart();
  
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  if (cartCount === 0) return null;

  return (
    <div
      onClick={() => navigate('/cart')}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl z-50 min-w-52"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-lg">Your Cart</div>
        <ShoppingCart size={24} />
      </div>
      <div className="text-sm mb-3">
        {cartCount} {cartCount === 1 ? 'item' : 'items'}
      </div>
      <button className="w-full bg-white text-primary-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
        View Cart • {formatCurrency(cartTotal)}
      </button>
    </div>
  );
};

export default FloatingCart;