export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Restaurant App';

export const CATEGORIES = [
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'raita', name: 'Raita', emoji: '🥛' },
  { id: 'salad', name: 'Salad', emoji: '🥗' },
  { id: 'rice', name: 'Rice', emoji: '🍚' },
  { id: 'toast', name: 'Toast', emoji: '🍞' },
  { id: 'tawe', name: 'Tawe', emoji: '🫓' },
  { id: 'tandoor', name: 'Tandoor', emoji: '🔥' },
  { id: 'drinksSnacks', name: 'Drinks', emoji: '🍹' },
  { id: 'snacks', name: 'Snacks', emoji: '🍟' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'beverage', name: 'Beverage', emoji: '☕' },
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
};

export const ORDER_TYPE = {
  DINE_IN: 'dine-in',
  TAKEAWAY: 'takeaway',
};

export const PORTION_TYPE = {
  HALF: 'half',
  FULL: 'full',
  SINGLE: 'single',
};

export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
};

export const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  ORDER_UPDATE: 'order_update',
  ADMIN_MESSAGE: 'admin_message',
};

export const GST_PERCENTAGE = 0.05;