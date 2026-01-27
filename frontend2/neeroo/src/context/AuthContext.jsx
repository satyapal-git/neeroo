import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { USER_ROLE } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      
      if (token && userRole) {
        setIsAuthenticated(true);
        setRole(userRole);
        
        // Fetch user profile
        if (userRole === USER_ROLE.USER) {
          const data = await authService.getUserProfile();
          setUser(data.user);
        } else if (userRole === USER_ROLE.ADMIN) {
          const data = await authService.getAdminProfile();
          setUser(data.admin);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userRole, userData) => {
    authService.setAuthData(token, userRole, userData.mobile, userData.name);
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};