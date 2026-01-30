// import { useNavigate } from 'react-router-dom';
// import { ShoppingCart } from 'lucide-react';
// import { useCart } from '../../hooks/useCart';
// import { formatCurrency } from '../../utils/helpers';

// const FloatingCart = () => {
//   const navigate = useNavigate();
//   const { getCartCount, getCartTotal } = useCart();
  
//   const cartCount = getCartCount();
//   const cartTotal = getCartTotal();

//   if (cartCount === 0) return null;

//   return (
//     <div
//       onClick={() => navigate('/cart')}
//       className="fixed bottom-8 right-8 bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl z-50 min-w-52"
//     >
//       <div className="flex items-center justify-between mb-2">
//         <div className="font-bold text-lg">Your Cart</div>
//         <ShoppingCart size={24} />
//       </div>
//       <div className="text-sm mb-3">
//         {cartCount} {cartCount === 1 ? 'item' : 'items'}
//       </div>
//       <button className="w-full bg-white text-primary-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
//         View Cart • {formatCurrency(cartTotal)}
//       </button>
//     </div>
//   );
// };

// export default FloatingCart;




// new  start




import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';

const FloatingCart = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal } = useCart();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = getCartTotal();

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#3D2415] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-lg z-50">
      <div>
        <p className="text-[0.65rem] sm:text-sm opacity-80 font-medium uppercase">
          {itemCount} Items
        </p>
        <p className="text-lg sm:text-2xl font-bold">{formatCurrency(total)}</p>
      </div>
      <button 
        onClick={() => navigate('/cart')}
        className="bg-white text-[#3D2415] px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm sm:text-base shadow-lg"
      >
        VIEW CART 
        <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default FloatingCart;
