import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { DemoModeProvider } from './contexts/DemoModeContext';
import { initializeBlocks } from './components/admin/pages/blocks';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import AccountPage from './pages/AccountPage';
import PublicPage from './pages/PublicPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load admin components (heavy dependencies)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const App: React.FC = () => {
  // Initialize blocks globally on app start
  useEffect(() => {
    initializeBlocks();
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin routes (no Layout wrapper) */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <DemoModeProvider>
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }>
                      <AdminDashboard />
                    </Suspense>
                  </DemoModeProvider>
                </ProtectedRoute>
              } 
            />
            
            {/* Regular routes with Layout wrapper */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/sessions" element={<SessionsPage />} />
                  <Route path="/session/:slug" element={<SessionDetailPage />} />
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute>
                        <AccountPage />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Static content pages with clean URLs */}
                  <Route path="/about" element={<PublicPage slug="about" />} />
                  <Route path="/contact" element={<PublicPage slug="contact" />} />
                  <Route path="/pricing" element={<PublicPage slug="pricing" />} />
                  <Route path="/rentals" element={<PublicPage slug="rentals" />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
