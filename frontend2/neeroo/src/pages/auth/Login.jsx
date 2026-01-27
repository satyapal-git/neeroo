import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { validateMobile, validateOTP } from '../../utils/validators';
import toast from 'react-hot-toast';
import { USER_ROLE } from '../../utils/constants';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateMobile(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.sendUserOTP(mobile);
      toast.success('OTP sent successfully!');
      setStep('otp');
      startTimer();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateOTP(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyUserOTP(mobile, otp);
      
      // Check if user exists and has name
      if (data.user && data.user.name) {
        // User exists, login directly
        login(data.token, USER_ROLE.USER, data.user);
        toast.success('Login successful!');
        navigate('/menu');
      } else {
        // New user, redirect to user details page
        login(data.token, USER_ROLE.USER, data.user);
        navigate('/user-details');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    setOtp('');
    setStep('mobile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg animate-gradient-shift p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🍽️ Taj Food Bakers
          </h1>
          <p className="text-gray-600">Authentic Indian Cuisine</p>
        </div>

        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                className="input-field"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !mobile}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="input-field"
                disabled={loading}
                autoFocus
              />
              {timer > 0 && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Resend OTP in {timer}s
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !otp}
              className="btn-primary w-full mb-3"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            {timer === 0 && (
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-primary-600 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            to="/admin/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;