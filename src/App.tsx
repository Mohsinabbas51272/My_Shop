import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import Contact from './components/Contact';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyOtp from './components/auth/VerifyOtp';
import ResetPassword from './components/auth/ResetPassword';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userRole?: 'USER' | 'ADMIN';
}

function ProtectedRoute({ children, userRole }: ProtectedRouteProps) {
  const { token, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) return null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && user?.role !== userRole) {
    // If user tries to access admin route, redirect to user dashboard and vice-versa
    const target = user?.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { theme } = useThemeStore();
  const { hasHydrated } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Prevent routing decisions before state is loaded from localStorage
  if (!hasHydrated) {
    return null;
  }

  return (
    <div className={theme === 'midnight' ? '' : `theme-${theme}`}>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute userRole="USER">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute userRole="USER">
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute userRole="USER">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute userRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
