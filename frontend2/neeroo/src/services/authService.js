import api from './api';

export const authService = {
  // User Auth
  sendUserOTP: async (mobile) => {
    return await api.post('/auth/send-otp', { mobile });
  },

  verifyUserOTP: async (mobile, otp) => {
    return await api.post('/auth/verify-otp', { mobile, otp });
  },

  updateUserDetails: async (userId, data) => {
    return await api.put(`/auth/user/${userId}`, data);
  },

  getUserProfile: async () => {
    return await api.get('/auth/profile');
  },

  // Admin Auth
  adminSignup: async (data) => {
    return await api.post('/admin/signup', data);
  },

  sendAdminOTP: async (mobile) => {
    return await api.post('/admin/send-otp', { mobile });
  },

  verifyAdminOTP: async (mobile, otp) => {
    return await api.post('/admin/verify-otp', { mobile, otp });
  },

  getAdminProfile: async () => {
    return await api.get('/admin/profile');
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