import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { APP_NAME } from '../../utils/constants';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Get user data from localStorage if context is empty
  const userName = user?.name || localStorage.getItem('userName') || '';
  const userMobile = user?.mobile || localStorage.getItem('userMobile') || '';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/menu" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-teal-500 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {/* My Orders Link */}
            <Link
              to="/orders"
              className="text-gray-700 hover:text-primary-600 font-semibold transition-colors"
            >
              My Orders
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <User size={24} />
              <span className="font-semibold hidden sm:inline">
                {userName || userMobile || 'User'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;