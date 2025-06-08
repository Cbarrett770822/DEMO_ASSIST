import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  Divider
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, loginSuccess } from '../../features/auth/authSlice';
import { updateCurrentUserToAdmin } from '../../utils/adminUtils';

/**
 * AdminPanel Component
 * 
 * A simple admin panel that provides tools to fix common issues,
 * including the admin role issue.
 */
const AdminPanel = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState('info');

  const handleFixAdminRole = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await updateCurrentUserToAdmin();
      
      if (result.success) {
        // Update the Redux store with the updated user
        dispatch(loginSuccess({
          ...currentUser,
          role: 'admin'
        }));
        
        setMessage('Admin role has been fixed successfully. Please refresh the page to see the changes.');
        setSeverity('success');
      } else {
        setMessage(`Failed to fix admin role: ${result.error}`);
        setSeverity('error');
      }
    } catch (error) {
      console.error('Error fixing admin role:', error);
      setMessage(`Error: ${error.message}`);
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Admin Tools
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Typography>
          <strong>Username:</strong> {currentUser?.username || 'Not logged in'}
        </Typography>
        <Typography>
          <strong>Role:</strong> {currentUser?.role || 'None'}
        </Typography>
        <Typography>
          <strong>ID:</strong> {currentUser?.id || 'None'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Fix Admin Role
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          If you're logged in as admin but don't see admin features, click the button below to fix your role.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleFixAdminRole}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Fixing...' : 'Fix Admin Role'}
        </Button>
      </Box>
      
      {message && (
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity={severity}
            action={
              severity === 'success' && (
                <Button color="inherit" size="small" onClick={handleRefreshPage}>
                  REFRESH
                </Button>
              )
            }
          >
            {message}
          </Alert>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Settings Persistence
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          We've fixed the settings persistence issue by properly integrating localStorage with the authentication system.
          Your settings should now persist across login, logout, and app relaunch cycles.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleRefreshPage}
        >
          Refresh Page
        </Button>
      </Box>
    </Paper>
  );
};

export default AdminPanel;
