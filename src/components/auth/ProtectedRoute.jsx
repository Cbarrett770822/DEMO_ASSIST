import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';

// Component to protect routes that require authentication
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Component to protect routes that require admin role
export const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'admin') {
    // Redirect to dashboard if authenticated but not admin
    return <Navigate to="/processes" replace />;
  }

  return children;
};

// Component to protect routes that require supervisor or admin role
export const SupervisorRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'supervisor') {
    // Redirect to dashboard if authenticated but not supervisor or admin
    return <Navigate to="/processes" replace />;
  }

  return children;
};

export default ProtectedRoute;
