import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'PATIENT':
        return <PatientDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'PHARMACIST':
        return <PharmacistDashboard />;
      default:
        return <Navigate to="/auth" replace />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <HomePage />
          )
        } 
      />
      <Route 
        path="/auth" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage />
          )
        }
              console.log('📝 Showing auth page for unauthenticated user');
              return <AuthPage />;
            })()
          )
        } 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {getDashboardComponent()}
          </ProtectedRoute>
        }
      />
      <Route 
        path="*" 
        element={
          user ? (
            (() => {
              console.log('❓ Redirecting authenticated user from unknown route to dashboard');
              return <Navigate to="/dashboard" replace />;
            })()
          ) : (
            (() => {
              console.log('❓ Redirecting unauthenticated user from unknown route to homepage');
              return <Navigate to="/" replace />;
            })()
          )
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;