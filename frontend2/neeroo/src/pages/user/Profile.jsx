import { useNavigate } from 'react-router-dom';
import { User, Phone, LogOut, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-2xl mx-auto p-4">
        <div className="card mb-6">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 text-primary-600 font-semibold hover:underline mb-4"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            👤 My Profile
          </h1>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="text-primary-600" size={24} />
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-semibold text-gray-800">
                  {user?.name || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="text-primary-600" size={24} />
              <div>
                <div className="text-sm text-gray-600">Mobile Number</div>
                <div className="font-semibold text-gray-800">{user?.mobile}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="card hover:shadow-lg transition-all text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <div className="font-semibold">My Orders</div>
          </button>

          <button
            onClick={() => navigate('/menu')}
            className="card hover:shadow-lg transition-all text-center"
          >
            <div className="text-4xl mb-2">🍽️</div>
            <div className="font-semibold">Browse Menu</div>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;