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
      const userMobile = localStorage.getItem('userMobile');
      const userName = localStorage.getItem('userName');
      
      if (token && userRole && userMobile) {
        setIsAuthenticated(true);
        setRole(userRole);
        
        // Set user from localStorage first (for immediate display)
        setUser({
          mobile: userMobile,
          name: userName || null,
        });
        
        // Then fetch fresh data from API
        try {
          if (userRole === USER_ROLE.USER) {
            const response = await authService.getUserProfile();
            // Backend returns: { success, message, data: { user } }
            const userData = response.data?.user || response.user;
            if (userData) {
              setUser(userData);
            }
          } else if (userRole === USER_ROLE.ADMIN) {
            const response = await authService.getAdminProfile();
            const adminData = response.data?.admin || response.admin;
            if (adminData) {
              setUser(adminData);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          // Keep using localStorage data if API fails
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
    console.log('Login called with:', { token, userRole, userData }); // Debug
    
    // Save to localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userMobile', userData.mobile);
    
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
    } else {
      localStorage.removeItem('userName'); // Remove if no name
    }
    
    // Update state
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
    
    console.log('User state set:', userData); // Debug
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userName');
    
    // Clear state
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update localStorage
    if (userData.mobile) {
      localStorage.setItem('userMobile', userData.mobile);
    }
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
    }
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