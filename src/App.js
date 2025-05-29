import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Import store
import store from './app/store';

// Import custom ThemeProvider that suppresses Grid warnings
import ThemeProvider from './theme/ThemeProvider';

// Import components
import Layout from './components/layout/Layout';
import DarkHomePage from './components/common/DarkHomePage';
import SettingsPage from './components/settings/SettingsPage';
import ProcessesDashboard from './components/dashboard/ProcessesDashboard';
import FlowPage from './components/tutorials/FlowPage';
import PresentationsPage from './components/common/PresentationsPage';
import LoginPage from './components/auth/LoginPage';
import UserManagement from './components/admin/UserManagement';
import { ProtectedRoute, AdminRoute, SupervisorRoute } from './components/auth/ProtectedRoute';
import { selectIsAuthenticated, logout } from './features/auth/authSlice';

// App wrapper with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

// Main app content with access to Redux hooks
function AppContent() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          isAuthenticated ? 
          <Layout onLogout={handleLogout}>
            <DarkHomePage />
          </Layout> : 
          <Navigate to="/login" />
        } />
        
        <Route path="/processes" element={
          isAuthenticated ? 
          <Layout onLogout={handleLogout}>
            <ProcessesDashboard />
          </Layout> : 
          <Navigate to="/login" />
        } />
        
        <Route path="/flow/:processId" element={
          isAuthenticated ? 
          <Layout onLogout={handleLogout}>
            <FlowPage />
          </Layout> : 
          <Navigate to="/login" />
        } />
        
        <Route path="/settings" element={
          <AdminRoute>
            <Layout onLogout={handleLogout}>
              <SettingsPage />
            </Layout>
          </AdminRoute>
        } />
        
        <Route path="/presentations" element={
          isAuthenticated ? 
          <Layout onLogout={handleLogout}>
            <PresentationsPage />
          </Layout> : 
          <Navigate to="/login" />
        } />
        
        <Route path="/users" element={
          <SupervisorRoute>
            <Layout onLogout={handleLogout}>
              <UserManagement />
            </Layout>
          </SupervisorRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
      
      {/* No redirect here - the protected routes handle this */}
    </>
  );
}

export default App;
