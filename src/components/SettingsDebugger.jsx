import React, { useState, useEffect } from 'react';
import { 
  Button, Typography, Paper, Box, Grid, Alert, 
  CircularProgress, Divider, Accordion, AccordionSummary,
  AccordionDetails, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAdmin, selectIsSupervisor } from '../features/auth/authSlice';
import { 
  loadSettings, saveSettings, 
  getCurrentUserId, getAuthToken, isAuthenticated
} from '../services/dbStorageService';
import { testApiEndpoint, testAllEndpoints } from '../utils/apiTester';
import config from '../config';

const SettingsDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ success: null, message: '' });
  const [testSettings, setTestSettings] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [testEndpoint, setTestEndpoint] = useState(`${config.apiUrl}/test-authentication`);
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false, message: '' });
  const [settingsHistory, setSettingsHistory] = useState([]);
  const [endpointTests, setEndpointTests] = useState(null);
  const [adminUpdateStatus, setAdminUpdateStatus] = useState(null);
  
  // Get user data from Redux store
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isSupervisor = useSelector(selectIsSupervisor);

  // Load all settings on component mount
  useEffect(() => {
    collectDebugInfo();
  }, []);
  
  // Track settings changes
  useEffect(() => {
    if (userSettings) {
      setSettingsHistory(prev => [
        {
          timestamp: new Date().toISOString(),
          source: 'User Settings',
          data: userSettings
        },
        ...prev.slice(0, 9) // Keep last 10 entries
      ]);
    }
  }, [userSettings]);
  
  useEffect(() => {
    if (globalSettings) {
      setSettingsHistory(prev => [
        {
          timestamp: new Date().toISOString(),
          source: 'Global Settings',
          data: globalSettings
        },
        ...prev.slice(0, 9) // Keep last 10 entries
      ]);
    }
  }, [globalSettings]);

  const collectDebugInfo = async () => {
    setLoading(true);
    
    // Get localStorage items
    const localStorageItems = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        localStorageItems[key] = localStorage.getItem(key);
      } catch (error) {
        localStorageItems[key] = `[Error reading value: ${error.message}]`;
      }
    }

    // Get authentication info
    const authToken = getAuthToken();
    const userId = getCurrentUserId();
    // Use the currentUser from Redux instead of calling getCurrentUser directly

    // Check MongoDB connection
    let mongoStatus = 'Unknown';
    try {
      const response = await fetch(`${config.apiUrl}/test-mongodb-connection`);
      const data = await response.json();
      mongoStatus = data.success ? 'Connected' : 'Error: ' + data.message;
    } catch (error) {
      mongoStatus = 'Error: ' + error.message;
    }
    
    // Load settings
    try {
      const userSettingsData = await loadSettings(true);
      setUserSettings(userSettingsData);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
    
    try {
      const globalSettingsData = await loadSettings(false);
      setGlobalSettings(globalSettingsData);
    } catch (error) {
      console.error('Error loading global settings:', error);
    }

    setDebugInfo({
      localStorageItems,
      authInfo: {
        hasToken: !!authToken,
        tokenLength: authToken ? authToken.length : 0,
        userId,
        userEmail: currentUser?.email || 'Not logged in',
        userRole: currentUser?.role || 'None',
        isAdmin,
        isSupervisor
      },
      mongoStatus,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
  };

  const testLoadSettings = async () => {
    setLoading(true);
    setApiStatus({ success: null, message: 'Loading settings...' });
    
    try {
      // Try to load user settings
      const userSettings = await loadSettings(true);
      setTestSettings(userSettings);
      setApiStatus({ success: true, message: 'Successfully loaded user settings from database' });
    } catch (error) {
      setApiStatus({ success: false, message: `Error loading settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const testSaveSettings = async () => {
    if (!testSettings) {
      setApiStatus({ success: false, message: 'No settings to save. Load settings first.' });
      return;
    }
    
    setLoading(true);
    setApiStatus({ success: null, message: 'Saving settings...' });
    
    try {
      // Add a timestamp to verify the save worked
      const updatedSettings = {
        ...testSettings,
        lastSaved: new Date().toISOString()
      };
      
      await saveSettings(updatedSettings, true);
      setTestSettings(updatedSettings);
      setApiStatus({ success: true, message: 'Successfully saved user settings to database' });
    } catch (error) {
      setApiStatus({ success: false, message: `Error saving settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const clearTestSettings = async () => {
    setLoading(true);
    setApiStatus({ success: null, message: 'Clearing settings...' });
    
    try {
      // Reset to default settings
      const defaultSettings = {
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        autoSave: true,
        presentationViewMode: 'embed',
        lastVisitedSection: null
      };
      
      await saveSettings(defaultSettings, true);
      setTestSettings(defaultSettings);
      setApiStatus({ success: true, message: 'Successfully reset settings to defaults' });
      
      // Refresh debug info
      await collectDebugInfo();
    } catch (error) {
      setApiStatus({ success: false, message: `Error clearing settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    setLoading(true);
    setAuthStatus({ isAuthenticated: false, message: 'Testing authentication...' });
    
    try {
      // Check if user is authenticated according to our service
      const authenticated = isAuthenticated();
      const token = getAuthToken();
      const userId = getCurrentUserId();
      // Use currentUser from Redux state instead of getCurrentUser()
      
      // Test the authentication endpoint
      const result = await testApiEndpoint(testEndpoint, 'GET');
      
      if (result.success) {
        setAuthStatus({ 
          isAuthenticated: true, 
          message: 'Authentication successful', 
          details: result.data 
        });
      } else {
        let message = `Authentication failed: ${result.error || 'Unknown error'}`;
        
        // Add more detailed diagnostics
        if (!token) message += ' - No authentication token found.';
        if (!userId) message += ' - No user ID found.';
        if (!currentUser) message += ' - No user object found.';
        
        setAuthStatus({ 
          isAuthenticated: false, 
          message,
          details: result.data
        });
      }
      
      // Refresh debug info
      await collectDebugInfo();
    } catch (error) {
      setAuthStatus({ 
        isAuthenticated: false, 
        message: `Error testing authentication: ${error.message}`,
        error: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testAllApiEndpoints = async () => {
    setLoading(true);
    setApiStatus({ success: null, message: 'Testing all API endpoints...' });
    
    try {
      // Test all endpoints
      const results = await testAllEndpoints(true);
      setEndpointTests(results);
      
      // Set status based on results
      const success = results.summary.successful === results.summary.total;
      setApiStatus({ 
        success, 
        message: success 
          ? 'All API endpoints tested successfully' 
          : `${results.summary.failed} of ${results.summary.total} API endpoints failed`
      });
    } catch (error) {
      setApiStatus({ 
        success: false, 
        message: `Error testing API endpoints: ${error.message}` 
      });
      setEndpointTests(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminRole = async () => {
    setLoading(true);
    setAdminUpdateStatus({ status: 'checking', message: 'Checking admin role status...' });
    
    try {
      // First test authentication to get current role information
      const authResult = await testApiEndpoint(`${config.apiUrl}/test-authentication`, 'GET');
      
      if (!authResult.success) {
        setAdminUpdateStatus({
          status: 'error',
          message: `Authentication check failed: ${authResult.error || 'Unknown error'}`
        });
        return;
      }
      
      // Check if user already has admin role
      const userData = authResult.data;
      const currentRole = userData?.user?.role || 'user';
      
      if (currentRole === 'admin') {
        setAdminUpdateStatus({
          status: 'success',
          message: 'You already have admin role privileges. All admin features should be accessible.'
        });
        return;
      }
      
      // If not admin, attempt to update role via API
      setAdminUpdateStatus({ status: 'updating', message: 'Attempting to update user role to admin...' });
      
      // Make API call to update user role
      const userId = getCurrentUserId();
      if (!userId) {
        setAdminUpdateStatus({
          status: 'error',
          message: 'Cannot update role: User ID not found. Please log in again.'
        });
        return;
      }
      
      const updateResult = await testApiEndpoint(
        `${config.apiUrl}/updateUserRole?userId=${userId}&role=admin`,
        'POST',
        { userId, role: 'admin' }
      );
      
      if (updateResult.success) {
        setAdminUpdateStatus({
          status: 'success',
          message: 'Successfully updated role to admin! Please log out and log back in for changes to take effect.'
        });
      } else {
        setAdminUpdateStatus({
          status: 'error',
          message: `Failed to update role: ${updateResult.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setAdminUpdateStatus({
        status: 'error',
        message: `Error verifying/updating admin role: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Settings Debugger</Typography>
      <Typography variant="body1" paragraph>
        This tool helps diagnose issues with settings storage, authentication, and MongoDB connectivity.
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={collectDebugInfo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Refresh Debug Info
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={testLoadSettings}
            disabled={loading}
          >
            Test Load Settings
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={testSaveSettings}
            disabled={loading || !testSettings}
          >
            Test Save Settings
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={clearTestSettings}
            disabled={loading || !testSettings}
          >
            Clear Test Settings
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined" 
            color="info" 
            onClick={testAllApiEndpoints}
            disabled={loading}
          >
            Test All API Endpoints
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="warning"
            onClick={verifyAdminRole}
            disabled={loading || isAdmin}
          >
            {isAdmin ? 'Admin Role Verified' : 'Verify/Grant Admin Role'}
          </Button>
        </Grid>
      </Grid>
      
      {/* Status message */}
      {apiStatus.message && (
        <Alert 
          severity={apiStatus.success === null ? 'info' : apiStatus.success ? 'success' : 'error'}
          sx={{ mb: 3 }}
        >
          {apiStatus.message}
        </Alert>
      )}
      
      {/* Admin Role Update Status */}
      {adminUpdateStatus && (
        <Alert 
          severity={adminUpdateStatus.status === 'checking' || adminUpdateStatus.status === 'updating' ? 'info' : 
                   adminUpdateStatus.status === 'success' ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          {adminUpdateStatus.message}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f8f8', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Test Authentication</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Test API Endpoint"
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              margin="normal"
              size="small"
              helperText="API endpoint to test authentication against"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={testAuthentication}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Test Authentication
            </Button>
          </Grid>
        </Grid>
        
        {authStatus.message && (
          <Alert 
            severity={authStatus.isAuthenticated ? "success" : "error"}
            sx={{ mt: 2 }}
          >
            {authStatus.message}
          </Alert>
        )}
      </Box>

      {/* Debug information sections */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Authentication Status</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            {debugInfo.authInfo ? (
              <>
                <Typography variant="body2"><strong>User ID:</strong> {debugInfo.authInfo.userId || 'Not found'}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {debugInfo.authInfo.userEmail}</Typography>
                <Typography variant="body2"><strong>Role:</strong> {debugInfo.authInfo.userRole}</Typography>
                <Typography variant="body2"><strong>Admin Access:</strong> {debugInfo.authInfo.isAdmin ? '✅ Yes' : '❌ No'}</Typography>
                <Typography variant="body2"><strong>Supervisor Access:</strong> {debugInfo.authInfo.isSupervisor ? '✅ Yes' : '❌ No'}</Typography>
                <Typography variant="body2"><strong>Auth Token:</strong> {debugInfo.authInfo.hasToken ? 'Present' : 'Missing'}</Typography>
                {debugInfo.authInfo.hasToken && (
                  <Typography variant="body2"><strong>Token Length:</strong> {debugInfo.authInfo.tokenLength} characters</Typography>
                )}
              </>
            ) : (
              <Typography variant="body2">Loading authentication info...</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">MongoDB Connection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Status:</strong> {debugInfo.mongoStatus || 'Unknown'}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Local Storage Items</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
            {Object.keys(debugInfo.localStorageItems || {}).length > 0 ? (
              Object.entries(debugInfo.localStorageItems || {}).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>{key}:</strong> {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No items in localStorage</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">User Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
            {userSettings ? (
              <pre style={{ margin: 0 }}>{JSON.stringify(userSettings, null, 2)}</pre>
            ) : (
              <Typography variant="body2">No user settings found</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Global Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
            {globalSettings ? (
              <pre style={{ margin: 0 }}>{JSON.stringify(globalSettings, null, 2)}</pre>
            ) : (
              <Typography variant="body2">No global settings found</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {testSettings && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Test Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(testSettings, null, 2)}</pre>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      {endpointTests && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">API Endpoint Tests</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Alert severity={endpointTests.summary.failed > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Summary:</strong> {endpointTests.summary.successful} of {endpointTests.summary.total} endpoints successful
                  {endpointTests.summary.authErrors > 0 && ` (${endpointTests.summary.authErrors} auth errors)`}
                  {endpointTests.summary.networkErrors > 0 && ` (${endpointTests.summary.networkErrors} network errors)`}
                </Typography>
              </Alert>
              
              {Object.entries(endpointTests.endpoints).map(([name, result]) => (
                <Accordion key={name} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography 
                      variant="body1" 
                      color={result.success ? "success.main" : "error.main"}
                    >
                      {name} {result.success ? "✓" : "✗"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
                      <Typography variant="body2"><strong>Endpoint:</strong> {result.endpoint}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {result.status}</Typography>
                      <Typography variant="body2"><strong>Time:</strong> {result.time}ms</Typography>
                      {result.error && (
                        <Typography variant="body2" color="error.main">
                          <strong>Error:</strong> {result.error}
                        </Typography>
                      )}
                      {result.data && (
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}><strong>Response Data:</strong></Typography>
                          <pre style={{ margin: 0, fontSize: '0.8rem' }}>{JSON.stringify(result.data, null, 2)}</pre>
                        </>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Settings History</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '500px', overflow: 'auto' }}>
            {settingsHistory.length > 0 ? (
              settingsHistory.map((entry, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">
                      {new Date(entry.timestamp).toLocaleString()} - {entry.source}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ p: 1, bgcolor: '#e8e8e8', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '0.8rem' }}>{JSON.stringify(entry.data, null, 2)}</pre>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2">No settings history recorded yet</Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" display="block">
        Last updated: {debugInfo.timestamp || 'Never'}
      </Typography>
    </Paper>
  );
};

export default SettingsDebugger;
