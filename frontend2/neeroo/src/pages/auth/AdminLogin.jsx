import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { validateMobile, validateOTP } from '../../utils/validators';
import toast from 'react-hot-toast';
import { USER_ROLE } from '../../utils/constants';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState('mobile');
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
      const response = await authService.sendAdminOTP(mobile);
      
      if (response.success) {
        toast.success(response.message || 'OTP sent successfully!');
        setStep('otp');
        startTimer();
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send Admin OTP Error:', error);
      toast.error(error.message || 'Failed to send OTP');
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
      const response = await authService.verifyAdminOTP(mobile, otp);
      
      if (response.success && response.data) {
        const { token, admin } = response.data;
        login(token, USER_ROLE.ADMIN, admin);
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify Admin OTP Error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
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

  const handleResend = async () => {
    setOtp('');
    await handleSendOTP({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg animate-gradient-shift p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔐 Admin Login
          </h1>
          <p className="text-gray-600">Restaurant Management Portal</p>
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
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !mobile || mobile.length !== 10}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="input-field text-center text-2xl tracking-widest"
                disabled={loading}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                OTP sent to {mobile}
              </p>
              {timer > 0 && (
                <p className="text-sm text-gray-600 mt-1 text-center">
                  Resend OTP in {timer}s
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 6}
              className="btn-primary w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('mobile');
                  setOtp('');
                  setTimer(0);
                }}
                className="text-gray-600 font-semibold hover:text-gray-800"
              >
                Change Number
              </button>
              
              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-primary-600 font-semibold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-2">Don't have an account?</p>
          <Link
            to="/admin/signup"
            className="text-primary-600 font-semibold hover:underline"
          >
            Admin Signup
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

export default AdminLogin;