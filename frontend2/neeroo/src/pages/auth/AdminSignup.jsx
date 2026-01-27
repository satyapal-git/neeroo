import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { validateMobile, validateEmail, validateRestaurantId } from '../../utils/validators';
import toast from 'react-hot-toast';

const AdminSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobile: '',
    email: '',
    restaurantId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMobile(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validateRestaurantId(formData.restaurantId)) {
      toast.error('Restaurant ID must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.adminSignup(formData);
      toast.success('Admin account created successfully!');
      setTimeout(() => {
        navigate('/admin/login');
      }, 1500);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg animate-gradient-shift p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔐 Admin Signup
          </h1>
          <p className="text-gray-600">Create your admin account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData(prev => ({ ...prev, mobile: value }));
              }}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Restaurant ID / Username
            </label>
            <input
              type="text"
              name="restaurantId"
              value={formData.restaurantId}
              onChange={handleChange}
              placeholder="Enter unique restaurant ID"
              className="input-field"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mb-3"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-2">Already have an account?</p>
          <Link
            to="/admin/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Admin Login
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link
            to="/"
            className="text-primary-600 font-semibold hover:underline"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;