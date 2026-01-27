import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { USER_ROLE } from './utils/constants';

// Auth Pages
import Login from './pages/auth/Login';
import UserDetails from './pages/auth/UserDetails';
import AdminSignup from './pages/auth/AdminSignup';
import AdminLogin from './pages/auth/AdminLogin';

// User Pages
import Menu from './pages/user/Menu';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AddItem from './pages/admin/AddItem';
import ManageItems from './pages/admin/ManageItems';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === USER_ROLE.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/menu" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/admin/signup" element={<PublicRoute><AdminSignup /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/user-details" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute role={USER_ROLE.USER}><Menu /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute role={USER_ROLE.USER}><Cart /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute role={USER_ROLE.USER}><Orders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role={USER_ROLE.USER}><Profile /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role={USER_ROLE.ADMIN}><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/add-item" element={<ProtectedRoute role={USER_ROLE.ADMIN}><AddItem /></ProtectedRoute>} />
      <Route path="/admin/manage-items" element={<ProtectedRoute role={USER_ROLE.ADMIN}><ManageItems /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <AppRoutes />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;