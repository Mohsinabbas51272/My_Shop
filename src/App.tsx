import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
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
  userRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

function ProtectedRoute({ children, userRole }: ProtectedRouteProps) {
  const { token, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) return null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Strict Role Checking
  if (userRole && user?.role !== userRole) {
    // If Admin tries to access User route -> Global Redirect
    // If User tries to access Admin route -> Global Redirect
    if (user?.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) return null;

  if (token && user) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
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
          {/* Public Routes - Only accessible if NOT logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected Routes */}
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
            path="/checkout"
            element={
              <ProtectedRoute userRole="USER">
                <Checkout />
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
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute userRole="SUPER_ADMIN">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root & Redirects */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {(() => {
                const { user } = useAuthStore.getState();
                if (user?.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
                if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
                return <Navigate to="/user/dashboard" replace />;
              })()}
            </ProtectedRoute>
          } />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
