// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { ArrowLeft } from 'lucide-react';
// // import CartItem from '../../components/user/CartItem';
// // import { useCart } from '../../hooks/useCart';
// // import { useOrders } from '../../hooks/useOrders';
// // import { formatCurrency } from '../../utils/helpers';
// // import { ORDER_TYPE } from '../../utils/constants';
// // import toast from 'react-hot-toast';

// // const Cart = () => {
// //   const navigate = useNavigate();
// //   const { cart, clearCart, getCartSubtotal, getCartGST, getCartTotal } = useCart();
// //   const { createOrder } = useOrders();
  
// //   const [orderType, setOrderType] = useState(ORDER_TYPE.DINE_IN);
// //   const [tableNumber, setTableNumber] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const subtotal = getCartSubtotal();
// //   const gst = getCartGST();
// //   const total = getCartTotal();

// //   const handlePlaceOrder = async () => {
// //     if (orderType === ORDER_TYPE.DINE_IN && !tableNumber.trim()) {
// //       toast.error('Please enter table number for dine-in orders');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const orderData = {
// //         items: cart.map(item => ({
// //           itemId: item.itemId,
// //           name: item.name,
// //           price: item.price,
// //           quantity: item.quantity,
// //           portion: item.portion,
// //         })),
// //         orderType,
// //         tableNumber: orderType === ORDER_TYPE.DINE_IN ? tableNumber : null,
// //         subtotal,
// //         gst,
// //         total,
// //       };

// //       const order = await createOrder(orderData);
// //       clearCart();
// //       toast.success(`Order placed successfully! Order ID: ${order.orderId}`);
// //       navigate('/orders');
// //     } catch (error) {
// //       // Error already shown by hook
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (cart.length === 0) {
// //     return (
// //       <div className="min-h-screen gradient-bg animate-gradient-shift flex items-center justify-center p-4">
// //         <div className="card max-w-md text-center">
// //           <div className="text-6xl mb-4">🛒</div>
// //           <h2 className="text-2xl font-bold mb-2">Your cart is empty!</h2>
// //           <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
// //           <button
// //             onClick={() => navigate('/menu')}
// //             className="btn-primary w-full"
// //           >
// //             Browse Menu
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen gradient-bg animate-gradient-shift p-4">
// //       <div className="max-w-4xl mx-auto">
// //         <div className="card mb-6">
// //           <button
// //             onClick={() => navigate('/menu')}
// //             className="flex items-center gap-2 text-primary-600 font-semibold hover:underline mb-4"
// //           >
// //             <ArrowLeft size={20} />
// //             Back to Menu
// //           </button>
// //           <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
// //             🛒 Your Cart
// //           </h1>
// //         </div>

// //         <div className="card mb-6">
// //           <div className="space-y-3">
// //             {cart.map((item) => (
// //               <CartItem key={item.itemKey} item={item} />
// //             ))}
// //           </div>
// //         </div>

// //         <div className="card mb-6">
// //           <h3 className="text-xl font-bold mb-4">Order Details</h3>
          
// //           <div className="flex gap-4 mb-4">
// //             <button
// //               onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}
// //               className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
// //                 orderType === ORDER_TYPE.DINE_IN
// //                   ? 'border-primary-500 bg-primary-50 text-primary-700'
// //                   : 'border-gray-300 hover:border-primary-300'
// //               }`}
// //             >
// //               Dine In
// //             </button>
// //             <button
// //               onClick={() => setOrderType(ORDER_TYPE.TAKEAWAY)}
// //               className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
// //                 orderType === ORDER_TYPE.TAKEAWAY
// //                   ? 'border-primary-500 bg-primary-50 text-primary-700'
// //                   : 'border-gray-300 hover:border-primary-300'
// //               }`}
// //             >
// //               Takeaway
// //             </button>
// //           </div>

// //           {orderType === ORDER_TYPE.DINE_IN && (
// //             <div>
// //               <label className="block text-gray-700 font-semibold mb-2">
// //                 Table Number
// //               </label>
// //               <input
// //                 type="text"
// //                 value={tableNumber}
// //                 onChange={(e) => setTableNumber(e.target.value)}
// //                 placeholder="Enter table number (e.g., T1, T2)"
// //                 className="input-field"
// //               />
// //             </div>
// //           )}
// //         </div>

// //         <div className="card mb-6 bg-gradient-to-r from-primary-500 to-purple-600 text-white">
// //           <div className="flex justify-between mb-3">
// //             <span>Subtotal:</span>
// //             <span>{formatCurrency(subtotal)}</span>
// //           </div>
// //           <div className="flex justify-between mb-3">
// //             <span>GST (5%):</span>
// //             <span>{formatCurrency(gst)}</span>
// //           </div>
// //           <div className="flex justify-between pt-3 border-t border-white border-opacity-30 text-xl font-bold">
// //             <span>Total Amount:</span>
// //             <span>{formatCurrency(total)}</span>
// //           </div>
// //         </div>

// //         <button
// //           onClick={handlePlaceOrder}
// //           disabled={loading}
// //           className="btn-success w-full text-lg py-4"
// //         >
// //           {loading ? 'Placing Order...' : 'Place Order'}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Cart;




// // new start
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
// import CartItem from '../../components/user/CartItem';
// import { useCart } from '../../hooks/useCart';
// import { useOrders } from '../../hooks/useOrders';
// import { formatCurrency } from '../../utils/helpers';
// import { ORDER_TYPE } from '../../utils/constants';
// import toast from 'react-hot-toast';

// const Cart = () => {
//   const navigate = useNavigate();
//   const { cart, clearCart, getCartSubtotal, getCartGST, getCartTotal } = useCart();
//   const { createOrder } = useOrders();
  
//   const [orderType, setOrderType] = useState(ORDER_TYPE.DINE_IN);
//   const [tableNumber, setTableNumber] = useState('');
//   const [loading, setLoading] = useState(false);

//   const subtotal = getCartSubtotal();
//   const gst = getCartGST();
//   const total = getCartTotal();

//   const handlePlaceOrder = async () => {
//     if (orderType === ORDER_TYPE.DINE_IN && !tableNumber.trim()) {
//       toast.error('Please enter table number for dine-in orders');
//       return;
//     }

//     setLoading(true);
//     try {
//       const orderData = {
//         items: cart.map(item => ({
//           itemId: item.itemId,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           portion: item.portion,
//         })),
//         orderType,
//         tableNumber: orderType === ORDER_TYPE.DINE_IN ? tableNumber : null,
//         subtotal,
//         gst,
//         total,
//       };

//       const order = await createOrder(orderData);
//       clearCart();
//       toast.success(`Order placed successfully! Order ID: ${order.orderId}`);
//       navigate('/orders');
//     } catch (error) {
//       // Error already shown by hook
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (cart.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F5' }}>
//         <div className="card max-w-md text-center">
//           <div className="text-6xl mb-4">🛒</div>
//           <h2 className="text-2xl font-bold mb-2">Your cart is empty!</h2>
//           <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
//           <button
//             onClick={() => navigate('/menu')}
//             className="w-full py-3 px-6 rounded-lg font-semibold transition-colors text-white"
//             style={{ backgroundColor: '#3D2415' }}
//             onMouseOver={(e) => e.target.style.backgroundColor = '#4D3425'}
//             onMouseOut={(e) => e.target.style.backgroundColor = '#3D2415'}
//           >
//             Browse Menu
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4" style={{ backgroundColor: '#FAF7F5' }}>
//       <div className="max-w-4xl mx-auto">
//         <div className="card mb-6">
//           <button
//             onClick={() => navigate('/menu')}
//             className="flex items-center gap-2 font-semibold hover:underline mb-4"
//             style={{ color: '#3D2415' }}
//           >
//             <ArrowLeft size={20} />
//             Back to Menu
//           </button>
//           <h1 className="text-3xl font-bold text-gray-900">
//             🛒 Your Cart
//           </h1>
//         </div>

//         <div className="card mb-6">
//           <div className="space-y-3">
//             {cart.map((item) => (
//               <CartItem key={item.itemKey} item={item} />
//             ))}
//           </div>
//         </div>

//         <div className="card mb-6">
//           <h3 className="text-xl font-bold mb-4">Order Details</h3>
          
//           <div className="flex gap-4 mb-4">
//             <button
//               onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}
//               className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all"
//               style={{
//                 borderColor: orderType === ORDER_TYPE.DINE_IN ? '#3D2415' : '#D1D5DB',
//                 backgroundColor: orderType === ORDER_TYPE.DINE_IN ? '#3D2415' : 'transparent',
//                 color: orderType === ORDER_TYPE.DINE_IN ? 'white' : 'inherit'
//               }}
//             >
//               Dine In
//             </button>
//             <button
//               onClick={() => setOrderType(ORDER_TYPE.TAKEAWAY)}
//               className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all"
//               style={{
//                 borderColor: orderType === ORDER_TYPE.TAKEAWAY ? '#3D2415' : '#D1D5DB',
//                 backgroundColor: orderType === ORDER_TYPE.TAKEAWAY ? '#3D2415' : 'transparent',
//                 color: orderType === ORDER_TYPE.TAKEAWAY ? 'white' : 'inherit'
//               }}
//             >
//               Takeaway
//             </button>
//           </div>

//           {orderType === ORDER_TYPE.DINE_IN && (
//             <div>
//               <label className="block text-gray-700 font-semibold mb-2">
//                 Table Number
//               </label>
//               <input
//                 type="text"
//                 value={tableNumber}
//                 onChange={(e) => setTableNumber(e.target.value)}
//                 placeholder="Enter table number (e.g., T1, T2)"
//                 className="input-field"
//               />
//             </div>
//           )}
//         </div>

//         <div className="card mb-6 text-white" style={{ backgroundColor: '#3D2415' }}>
//           <div className="flex justify-between mb-3">
//             <span>Subtotal:</span>
//             <span>{formatCurrency(subtotal)}</span>
//           </div>
//           <div className="flex justify-between mb-3">
//             <span>GST (5%):</span>
//             <span>{formatCurrency(gst)}</span>
//           </div>
//           <div className="flex justify-between pt-3 border-t border-white border-opacity-30 text-xl font-bold">
//             <span>Total Amount:</span>
//             <span>{formatCurrency(total)}</span>
//           </div>
//         </div>

//         <button
//           onClick={handlePlaceOrder}
//           disabled={loading}
//           className="w-full text-lg py-4 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
//           style={{ backgroundColor: '#3D2415' }}
//           onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4D3425')}
//           onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3D2415')}
//         >
//           {loading ? 'Placing Order...' : 'Place Order'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;


// new start

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CartItem from '../../components/user/CartItem';
import RazorpayPayment from '../../components/user/RazorpayPayment';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/helpers';
import { ORDER_TYPE } from '../../utils/constants';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getCartSubtotal, getCartGST, getCartTotal } = useCart();
  const { createOrder } = useOrders();
  
  const [orderType, setOrderType] = useState(ORDER_TYPE.DINE_IN);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const subtotal = getCartSubtotal();
  const gst = getCartGST();
  const total = getCartTotal();

  const handlePlaceOrder = async () => {
    if (orderType === ORDER_TYPE.DINE_IN && !tableNumber.trim()) {
      toast.error('Please enter table number for dine-in orders');
      return;
    }

    if (paymentMethod === 'online') {
      // For online payment, show payment UI first
      setShowPayment(true);
    } else {
      // For cash payment, create order directly
      setLoading(true);
      try {
        const orderData = {
          items: cart.map(item => ({
            itemId: item.itemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            portion: item.portion,
          })),
          orderType,
          tableNumber: orderType === ORDER_TYPE.DINE_IN ? tableNumber : null,
          subtotal,
          gst,
          total,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
        };

        const order = await createOrder(orderData);
        clearCart();
        toast.success(`Order placed successfully! Order ID: ${order.orderId}`);
        navigate('/orders');
      } catch (error) {
        // Error already shown by hook
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          portion: item.portion,
        })),
        orderType,
        tableNumber: orderType === ORDER_TYPE.DINE_IN ? tableNumber : null,
        subtotal,
        gst,
        total,
        paymentMethod: 'online',
        paymentStatus: 'completed',
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
      };

      const order = await createOrder(orderData);
      clearCart();
      setShowPayment(false);
      toast.success(`Order placed successfully! Order ID: ${order.orderId}`);
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to create order after payment. Please contact support with your payment ID: ' + paymentDetails.razorpayPaymentId);
      console.error('Order creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = () => {
    setShowPayment(false);
    toast.error('Payment failed. Please try again.');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F5' }}>
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty!</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
          <button
            onClick={() => navigate('/menu')}
            className="w-full py-3 px-6 rounded-lg font-semibold transition-colors text-white"
            style={{ backgroundColor: '#3D2415' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4D3425'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3D2415'}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ backgroundColor: '#FAF7F5' }}>
      <div className="max-w-4xl mx-auto">
        <div className="card mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 font-semibold hover:underline mb-3 sm:mb-4"
            style={{ color: '#3D2415' }}
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🛒 Your Cart
          </h1>
        </div>

        <div className="card mb-4 sm:mb-6">
          <div className="space-y-3">
            {cart.map((item) => (
              <CartItem key={item.itemKey} item={item} />
            ))}
          </div>
        </div>

        <div className="card mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Order Details</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <button
              onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}
              disabled={showPayment}
              className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all disabled:opacity-50"
              style={{
                borderColor: orderType === ORDER_TYPE.DINE_IN ? '#3D2415' : '#D1D5DB',
                backgroundColor: orderType === ORDER_TYPE.DINE_IN ? '#3D2415' : 'transparent',
                color: orderType === ORDER_TYPE.DINE_IN ? 'white' : 'inherit'
              }}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType(ORDER_TYPE.TAKEAWAY)}
              disabled={showPayment}
              className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all disabled:opacity-50"
              style={{
                borderColor: orderType === ORDER_TYPE.TAKEAWAY ? '#3D2415' : '#D1D5DB',
                backgroundColor: orderType === ORDER_TYPE.TAKEAWAY ? '#3D2415' : 'transparent',
                color: orderType === ORDER_TYPE.TAKEAWAY ? 'white' : 'inherit'
              }}
            >
              Takeaway
            </button>
          </div>

          {orderType === ORDER_TYPE.DINE_IN && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Table Number
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={showPayment}
                placeholder="Enter table number (e.g., T1, T2)"
                className="input-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {!showPayment && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Payment Method
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setPaymentMethod('online')}
                  className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all text-sm sm:text-base"
                  style={{
                    borderColor: paymentMethod === 'online' ? '#3D2415' : '#D1D5DB',
                    backgroundColor: paymentMethod === 'online' ? '#3D2415' : 'transparent',
                    color: paymentMethod === 'online' ? 'white' : 'inherit'
                  }}
                >
                  💳 Online Payment
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className="flex-1 py-3 rounded-lg border-2 font-semibold transition-all text-sm sm:text-base"
                  style={{
                    borderColor: paymentMethod === 'cash' ? '#3D2415' : '#D1D5DB',
                    backgroundColor: paymentMethod === 'cash' ? '#3D2415' : 'transparent',
                    color: paymentMethod === 'cash' ? 'white' : 'inherit'
                  }}
                >
                  💵 Pay at Counter
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card mb-4 sm:mb-6 text-white" style={{ backgroundColor: '#3D2415' }}>
          <div className="flex justify-between mb-2 sm:mb-3 text-sm sm:text-base">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2 sm:mb-3 text-sm sm:text-base">
            <span>GST (5%):</span>
            <span>{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-white border-opacity-30 text-lg sm:text-xl font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {!showPayment ? (
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full text-base sm:text-lg py-3 sm:py-4 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{ backgroundColor: '#3D2415' }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4D3425')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3D2415')}
          >
            {loading ? 'Processing...' : paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="card bg-blue-50 border-2 border-blue-400">
              <p className="text-center font-semibold text-gray-800 text-sm sm:text-base">
                💳 Complete your payment to place the order
              </p>
              <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                Amount: <span className="font-bold">{formatCurrency(total)}</span>
              </p>
            </div>
            <RazorpayPayment
              amount={total}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
            <button
              onClick={() => setShowPayment(false)}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
            >
              Cancel Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;