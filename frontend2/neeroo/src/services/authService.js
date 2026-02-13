import api from './api';

export const authService = {
  // User Auth
  sendUserOTP: async (mobile) => {
    // api.post already returns { success, message, data } from interceptor
    const response = await api.post('/auth/send-otp', { mobile });
    return response; // Return full response: { success, message, data }
  },

  verifyUserOTP: async (mobile, otp) => {
    const response = await api.post('/auth/verify-otp', { mobile, otp });
    return response; // Return full response: { success, message, data }
  },

  updateUserDetails: async (userId, data) => {
    const response = await api.put(`/auth/user/${userId}`, data);
    return response;
  },

  getUserProfile: async () => {
    const response = await api.get('/auth/profile');
    return response;
  },

  // Admin Auth
  adminSignup: async (data) => {
    const response = await api.post('/admin/signup', data);
    return response;
  },

  sendAdminOTP: async (mobile) => {
    const response = await api.post('/admin/send-otp', { mobile });
    return response;
  },

  verifyAdminOTP: async (mobile, otp) => {
    const response = await api.post('/admin/verify-otp', { mobile, otp });
    return response;
  },

  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response;
  },

  // Common
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userName');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  getRole: () => {
    return localStorage.getItem('userRole');
  },

  setAuthData: (token, role, mobile, name = null) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userMobile', mobile);
    if (name) {
      localStorage.setItem('userName', name);
    }
  },
};