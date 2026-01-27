import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { validateName } from '../../utils/validators';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.updateUserDetails(user._id, { name: name.trim() });
      updateUser({ name: name.trim() });
      localStorage.setItem('userName', name.trim());
      toast.success('Profile updated successfully!');
      navigate('/menu');
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
            Welcome! 👋
          </h1>
          <p className="text-gray-600">Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="input-field"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-blue-700">
              <strong>Mobile:</strong> {user?.mobile}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary w-full"
          >
            {loading ? 'Saving...' : 'Continue to Menu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;