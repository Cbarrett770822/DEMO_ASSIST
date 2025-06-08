import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAdmin } from '../features/auth/authSlice';
import AdminPanel from '../components/admin/AdminPanel';
import UserDebugger from '../components/admin/UserDebugger';
import UserList from '../components/admin/UserList';

/**
 * AdminToolsPage Component
 * 
 * A page that provides access to various admin tools,
 * including fixing the admin role issue and managing settings persistence.
 */
const AdminToolsPage = () => {
  const isAdmin = useSelector(selectIsAdmin);
  
  // Redirect non-admin users to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Tools
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          This page provides tools to help manage the application, fix issues, and ensure proper functionality.
        </Typography>
        
        <AdminPanel />
        
        <UserList />
        
        <UserDebugger />
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Settings Persistence Information
          </Typography>
          <Typography variant="body1" paragraph>
            We've fixed the issue where settings were disappearing when the app was relaunched. The fix involved:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Properly integrating the unified settings service with authentication
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Ensuring settings are saved to both localStorage and the server
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Fixing the handleUserLogin and handleUserLogout functions to properly sync settings
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Adding proper error handling and recovery mechanisms
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Using file-based storage instead of SQLite for easier maintenance and deployment
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminToolsPage;
