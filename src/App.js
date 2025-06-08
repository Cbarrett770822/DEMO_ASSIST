import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Import store
import store from './app/store';

// Import custom ThemeProvider that suppresses Grid warnings
import ThemeProvider from './theme/ThemeProvider';

// Import services
import { checkAndFixAuthState } from './services/auth/authService';
import * as unifiedSettingsService from './services/unifiedSettingsService';

// Import components
import Layout from './components/layout/Layout';
import DarkHomePage from './components/common/DarkHomePage';
import SettingsPage from './components/settings/SettingsPage';
import ProcessesDashboard from './components/dashboard/ProcessesDashboard';
import FlowPage from './components/tutorials/FlowPage';
import PresentationsPage from './components/common/PresentationsPage';
import LoginPage from './components/auth/LoginPage';
import UserProfile from './components/auth/UserProfile';
import UserManagement from './components/settings/UserManagement';
import SettingsDebugger from './components/SettingsDebugger';
import AdminToolsPage from './pages/AdminToolsPage';
import ApiDiagnostics from './components/diagnostics/ApiDiagnostics';
import DebugPage from './pages/DebugPage';
import { ProtectedRoute, AdminRoute, SupervisorRoute } from './components/auth/ProtectedRoute';
import { selectIsAuthenticated, logout, checkAuthState } from './features/auth/authSlice';

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
  
  // Initialize app on load - check auth state and load settings
  useEffect(() => {
    // First check for and fix any inconsistent auth state
    const wasFixed = checkAndFixAuthState();
    if (wasFixed) {
      console.log('Fixed inconsistent auth state during app initialization');
    }
    
    // Then check authentication state through Redux
    dispatch(checkAuthState());
    
    // Initialize settings using the unified settings service
    const initializeSettings = async () => {
      try {
        // Check if user is authenticated to load the right settings
        const currentUser = localStorage.getItem('wms_current_user');
        const authToken = localStorage.getItem('wms_auth_token');
        
        if (currentUser && authToken) {
          // User is authenticated, load user-specific settings
          try {
            const user = JSON.parse(currentUser);
            console.log('Loading settings for authenticated user:', user.id || user._id);
            const settings = await unifiedSettingsService.handleUserLogin(user.id || user._id);
            console.log('User-specific settings loaded:', settings);
          } catch (userSettingsError) {
            console.error('Error loading user-specific settings:', userSettingsError);
            // Fall back to default initialization
            const settings = await unifiedSettingsService.initSettings();
            console.log('Fallback settings initialized:', settings);
          }
        } else {
          // No authenticated user, initialize with global settings
          const settings = await unifiedSettingsService.initSettings();
          console.log('Global settings initialized:', settings);
        }
      } catch (error) {
        console.error('Error during settings initialization:', error);
      }
    };
    
    initializeSettings();
    
    // Listen for settings changes and other settings-related events
    const handleSettingsLoaded = (event) => {
      console.log('Settings loaded event received:', event.detail);
      // You could dispatch a Redux action here to update the app state if needed
    };
    
    const handleSettingsSaved = (event) => {
      console.log('Settings saved event received:', event.detail);
    };
    
    const handleSettingsError = (event) => {
      console.error('Settings error event received:', event.detail);
    };
    
    window.addEventListener('settings-loaded', handleSettingsLoaded);
    window.addEventListener('settings-saved-to-server', handleSettingsSaved);
    window.addEventListener('settings-error', handleSettingsError);
    
    return () => {
      window.removeEventListener('settings-loaded', handleSettingsLoaded);
      window.removeEventListener('settings-saved-to-server', handleSettingsSaved);
      window.removeEventListener('settings-error', handleSettingsError);
    };
  }, [dispatch]);
  
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
        
        <Route path="/profile" element={
          isAuthenticated ? 
          <Layout onLogout={handleLogout}>
            <UserProfile />
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
        
        <Route path="/debug/settings" element={
          <AdminRoute>
            <Layout onLogout={handleLogout}>
              <SettingsDebugger />
            </Layout>
          </AdminRoute>
        } />
        
        <Route path="/admin/tools" element={
          <AdminRoute>
            <Layout onLogout={handleLogout}>
              <AdminToolsPage />
            </Layout>
          </AdminRoute>
        } />
        
        <Route path="/debug/api" element={
          <AdminRoute>
            <Layout onLogout={handleLogout}>
              <ApiDiagnostics />
            </Layout>
          </AdminRoute>
        } />
        
        <Route path="/debug" element={
          <AdminRoute>
            <Layout onLogout={handleLogout}>
              <DebugPage />
            </Layout>
          </AdminRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
      
      {/* No redirect here - the protected routes handle this */}
    </>
  );
}

export default App;
