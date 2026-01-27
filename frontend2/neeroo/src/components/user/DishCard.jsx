import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { getImageUrl, formatCurrency } from '../../utils/helpers';

const DishCard = ({ dish }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [selectedPortion, setSelectedPortion] = useState(
    dish.halfPrice && dish.fullPrice ? 'full' : 'half'
  );

  const itemKey = `${dish._id}_${selectedPortion}`;
  const cartItem = cart.find(item => item.itemKey === itemKey);
  const quantity = cartItem?.quantity || 0;

  const currentPrice = selectedPortion === 'half' ? dish.halfPrice : dish.fullPrice || dish.halfPrice;

  const handleAddToCart = () => {
    addToCart(dish, selectedPortion, 1);
  };

  const handleIncrement = () => {
    updateQuantity(itemKey, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(itemKey, quantity - 1);
  };

  return (
    <div className={`card transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      !dish.inStock ? 'opacity-50 grayscale' : ''
    }`}>
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={getImageUrl(dish.image)}
          alt={dish.name}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-110"
        />
        {!dish.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
        {dish.name}
      </h3>

      {dish.halfPrice && dish.fullPrice ? (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedPortion('half')}
            className={`flex-1 py-3 rounded-lg border-2 transition-all ${
              selectedPortion === 'half'
                ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                : 'border-gray-300 hover:border-primary-300'
            }`}
          >
            <div className="text-xs text-gray-600 font-bold uppercase">Half</div>
            <div className="text-lg font-bold text-primary-600">
              {formatCurrency(dish.halfPrice)}
            </div>
          </button>
          <button
            onClick={() => setSelectedPortion('full')}
            className={`flex-1 py-3 rounded-lg border-2 transition-all ${
              selectedPortion === 'full'
                ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                : 'border-gray-300 hover:border-primary-300'
            }`}
          >
            <div className="text-xs text-gray-600 font-bold uppercase">Full</div>
            <div className="text-lg font-bold text-primary-600">
              {formatCurrency(dish.fullPrice)}
            </div>
          </button>
        </div>
      ) : (
        <div className="text-center py-3 mb-4 bg-primary-50 border-2 border-primary-500 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {formatCurrency(currentPrice)}
          </div>
        </div>
      )}

      {dish.inStock ? (
        quantity > 0 ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDecrement}
              className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110"
            >
              <Minus size={20} />
            </button>
            <span className="text-xl font-bold min-w-8 text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110"
            >
              <Plus size={20} />
            </button>
          </div>
        ) : (
          <button onClick={handleAddToCart} className="btn-success w-full">
            Add to Cart
          </button>
        )
      ) : (
        <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
          Unavailable
        </button>
      )}
    </div>
  );
};

export default DishCard;