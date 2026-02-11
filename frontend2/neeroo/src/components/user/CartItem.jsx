// import { Plus, Minus, Trash2 } from 'lucide-react';
// import { useCart } from '../../hooks/useCart';
// import { formatCurrency, getImageUrl } from '../../utils/helpers';

// const CartItem = ({ item }) => {
//   const { updateQuantity, removeFromCart } = useCart();

//   const handleIncrement = () => {
//     updateQuantity(item.itemKey, item.quantity + 1);
//   };

//   const handleDecrement = () => {
//     updateQuantity(item.itemKey, item.quantity - 1);
//   };

//   const handleRemove = () => {
//     removeFromCart(item.itemKey);
//   };

//   const itemTotal = item.price * item.quantity;

//   return (
//     <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-all border border-gray-200">
//       <img
//         src={getImageUrl(item.image)}
//         alt={item.name}
//         className="w-20 h-20 rounded-lg object-cover"
//       />
      
//       <div className="flex-1">
//         <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
//         <p className="text-gray-600 text-sm">{formatCurrency(item.price)} each</p>
//       </div>

//       <div className="flex items-center gap-3">
//         <button
//           onClick={handleDecrement}
//           className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
//         >
//           <Minus size={16} />
//         </button>
//         <span className="text-lg font-bold min-w-6 text-center">{item.quantity}</span>
//         <button
//           onClick={handleIncrement}
//           className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all"
//         >
//           <Plus size={16} />
//         </button>
//       </div>

//       <div className="text-right min-w-24">
//         <div className="font-bold text-lg text-primary-600">
          
//           {formatCurrency(itemTotal)}
//         </div>
//       </div>

//       <button
//         onClick={handleRemove}
//         className="text-red-500 hover:text-red-700 transition-colors p-2"
//       >
//         <Trash2 size={20} />
//       </button>
//     </div>
//   );
// };

// export default CartItem;



// new start
// import { Plus, Minus, Trash2 } from 'lucide-react';
// import { useCart } from '../../hooks/useCart';
// import { formatCurrency, getImageUrl } from '../../utils/helpers';

// const CartItem = ({ item }) => {
//   const { updateQuantity, removeFromCart } = useCart();

//   const handleIncrement = () => {
//     updateQuantity(item.itemKey, item.quantity + 1);
//   };

//   const handleDecrement = () => {
//     updateQuantity(item.itemKey, item.quantity - 1);
//   };

//   const handleRemove = () => {
//     removeFromCart(item.itemKey);
//   };

//   const itemTotal = item.price * item.quantity;

//   return (
//     <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-all border border-gray-200">
//       <img
//         src={getImageUrl(item.image)}
//         alt={item.name}
//         className="w-20 h-20 rounded-lg object-cover"
//       />
      
//       <div className="flex-1">
//         <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
//         <p className="text-gray-600 text-sm">{formatCurrency(item.price)} each</p>
//       </div>

//       <div className="flex items-center gap-3">
//         <button
//           onClick={handleDecrement}
//           className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
//         >
//           <Minus size={16} />
//         </button>
//         <span className="text-lg font-bold min-w-6 text-center">{item.quantity}</span>
//         <button
//           onClick={handleIncrement}
//           className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all"
//         >
//           <Plus size={16} />
//         </button>
//       </div>

//       <div className="text-right min-w-24">
//         <div className="font-bold text-lg" style={{ color: '#3D2415' }}>
//           {formatCurrency(itemTotal)}
//         </div>
//       </div>

//       <button
//         onClick={handleRemove}
//         className="text-red-500 hover:text-red-700 transition-colors p-2"
//       >
//         <Trash2 size={20} />
//       </button>
//     </div>
//   );
// };

// export default CartItem;




// new start
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:bg-gray-50 transition-all border border-gray-200">
      {/* Image and Item Details */}
      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base truncate">{item.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">{formatCurrency(item.price)} each</p>
        </div>
      </div>

      {/* Quantity Controls, Price, and Delete - Mobile Layout */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleDecrement}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center transition-all flex-shrink-0"
            style={{ backgroundColor: '#FF8C00' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#FFB84D'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FF8C00'}
          >
            <Minus size={14} className="sm:w-4 sm:h-4" />
          </button>
          <span className="text-base sm:text-lg font-bold min-w-[24px] sm:min-w-[28px] text-center">{item.quantity}</span>
          <button
            onClick={handleIncrement}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center transition-all flex-shrink-0"
            style={{ backgroundColor: '#3D2415' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4D3425'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3D2415'}
          >
            <Plus size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="text-right min-w-[70px] sm:min-w-[96px]">
          <div className="font-bold text-base sm:text-lg text-gray-900">
            {formatCurrency(itemTotal)}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 transition-colors p-1.5 sm:p-2 flex-shrink-0"
          aria-label="Remove item"
        >
          <Trash2 size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;