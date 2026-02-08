import { useState } from 'react';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RazorpayPayment = ({ orderId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      console.log("🔥 Calling createPaymentOrder with orderId:", orderId);

      // Create payment order from backend
      const paymentData = await paymentService.createPaymentOrder(orderId);

      console.log("🔥 Payment data from backend:", paymentData);

      // Razorpay options
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Neeroo Restaurant',
        description: `Order Payment - ${orderId}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            console.log("🔥 Razorpay handler response:", response);

            // Verify payment on backend
            const verificationData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderId,
            };

            await paymentService.verifyPayment(verificationData);
            
            toast.success('Payment successful! 🎉');
            
            if (onSuccess) {
              onSuccess(response);
            } else {
              navigate('/orders');
            }
          } catch (error) {
            console.error("🔥 Verify payment error:", error);
            toast.error('Payment verification failed');
            if (onFailure) {
              onFailure(error);
            }
          }
        },
        theme: {
          color: '#3D2415',
        },
        modal: {
          ondismiss: async () => {
            await paymentService.handlePaymentFailure(orderId, {
              reason: 'Payment cancelled by user',
            });
            toast.error('Payment cancelled');
            setLoading(false);
            if (onFailure) {
              onFailure('Payment cancelled');
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async (response) => {
        console.error("🔥 Razorpay payment.failed:", response);
        await paymentService.handlePaymentFailure(orderId, response.error);
        toast.error('Payment failed. Please try again.');
        setLoading(false);
        if (onFailure) {
          onFailure(response.error);
        }
      });

      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error('🔥 Payment error:', error);
      toast.error(error?.message || 'Failed to initiate payment');
      setLoading(false);
      if (onFailure) {
        onFailure(error);
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full text-lg py-4 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
      style={{ backgroundColor: '#3D2415' }}
      onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4D3425')}
      onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3D2415')}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;