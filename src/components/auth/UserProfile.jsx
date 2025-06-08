import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Snackbar,
  Avatar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  selectCurrentUser, 
  selectIsAuthenticated,
  selectAuthError
} from '../../features/auth/authSlice';
import { getCurrentUser } from '../../services/authService';
import { getSettings } from '../../services/settingsService';

const UserProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authError = useSelector(selectAuthError);
  
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [userSettings, setUserSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        const settings = await getSettings();
        setUserSettings(settings);
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Clear error
    setError('');
    
    // Change password - this would be implemented in a future update
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="warning">
        You must be logged in to view this page.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 3
                }}
              >
                {currentUser?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {currentUser?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  Role: <Chip size="small" color={currentUser?.role === 'admin' ? 'error' : 'primary'} label={currentUser?.role} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since: {new Date(currentUser?.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                User Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
            
            {loadingSettings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : userSettings ? (
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Theme" 
                    secondary={userSettings.theme || 'light'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Font Size" 
                    secondary={userSettings.fontSize || 'medium'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Notifications" 
                    secondary={userSettings.notifications ? 'Enabled' : 'Disabled'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Auto Save" 
                    secondary={userSettings.autoSave ? 'Enabled' : 'Disabled'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Presentation View Mode" 
                    secondary={userSettings.presentationViewMode || 'embed'} 
                  />
                </ListItem>
              </List>
            ) : (
              <Alert severity="info">
                No settings found. Default settings will be used.
              </Alert>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => window.location.href = '/settings'}
              >
                Manage Settings
              </Button>
            </Box>
            </Paper>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handlePasswordChange}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;
