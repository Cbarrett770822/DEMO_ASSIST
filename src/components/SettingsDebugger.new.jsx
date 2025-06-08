import React, { useState, useEffect } from 'react';
import { 
  Button, Typography, Paper, Box, Grid, Alert, 
  CircularProgress, Divider, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  loadSettings, saveSettings, getCurrentUser, 
  getCurrentUserId, getAuthToken 
} from '../services/dbStorageService';

const SettingsDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ success: null, message: '' });
  const [testSettings, setTestSettings] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);

  // Load all settings on component mount
  useEffect(() => {
    collectDebugInfo();
  }, []);

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
    const currentUser = getCurrentUser();
    const userId = getCurrentUserId();

    // Check MongoDB connection
    let mongoStatus = 'Unknown';
    try {
      const response = await fetch('/.netlify/functions/test-mongodb-connection');
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
        userRole: currentUser?.role || 'None'
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
      // Create empty settings object
      const emptySettings = {
        theme: 'light',
        language: 'en',
        notifications: false,
        clearedAt: new Date().toISOString()
      };
      
      await saveSettings(emptySettings, true);
      setTestSettings(emptySettings);
      setApiStatus({ success: true, message: 'Successfully cleared user settings' });
    } catch (error) {
      setApiStatus({ success: false, message: `Error clearing settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Settings Debugger</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Database-Only Storage Mode
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          This tool helps diagnose settings persistence issues by showing database connectivity, 
          authentication status, and settings data.
        </Typography>
      </Box>

      {/* Action buttons */}
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
            onClick={testLoadSettings}
            disabled={loading}
          >
            Test Load Settings
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined"
            onClick={testSaveSettings}
            disabled={loading || !testSettings}
          >
            Test Save Settings
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="outlined"
            color="warning"
            onClick={clearTestSettings}
            disabled={loading}
          >
            Clear Settings
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

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" display="block">
        Last updated: {debugInfo.timestamp || 'Never'}
      </Typography>
    </Paper>
  );
};

export default SettingsDebugger;
