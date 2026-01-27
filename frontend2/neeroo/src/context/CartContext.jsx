import { createContext, useState, useEffect } from 'react';
import { calculateGST, calculateTotal } from '../utils/helpers';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cart]);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item, portion = 'full', quantity = 1) => {
    const itemKey = `${item._id}_${portion}`;
    const price = portion === 'half' ? item.halfPrice : item.fullPrice || item.halfPrice;
    
    const existingItem = cart.find(c => c.itemKey === itemKey);
    
    if (existingItem) {
      updateQuantity(itemKey, existingItem.quantity + quantity);
    } else {
      const cartItem = {
        itemKey,
        itemId: item._id,
        name: `${item.name}${portion === 'half' ? ' (Half)' : portion === 'full' ? ' (Full)' : ''}`,
        originalName: item.name,
        price,
        portion,
        quantity,
        image: item.image,
      };
      setCart(prev => [...prev, cartItem]);
    }
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
    } else {
      setCart(prev =>
        prev.map(item =>
          item.itemKey === itemKey
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    return calculateTotal(subtotal);
  };

  const getCartGST = () => {
    const subtotal = getCartSubtotal();
    return calculateGST(subtotal);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartSubtotal,
    getCartTotal,
    getCartGST,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};