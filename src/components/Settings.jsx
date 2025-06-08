import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel,
  Switch,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import * as unifiedSettingsService from '../services/unifiedSettingsService';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
    autoSave: true,
    presentationViewMode: 'embed'
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userSettings = await unifiedSettingsService.initSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Error loading settings', 'error');
      }
    };

    loadUserSettings();
    
    // Listen for settings changes from other components
    const handleSettingsLoaded = (event) => {
      setSettings(unifiedSettingsService.loadSettings());
    };
    
    window.addEventListener('settings-loaded', handleSettingsLoaded);
    
    return () => {
      window.removeEventListener('settings-loaded', handleSettingsLoaded);
    };
  }, []);

  // Handle setting changes
  const handleSettingChange = async (key, value) => {
    try {
      // Update the specific setting
      const success = await unifiedSettingsService.updateSetting(key, value);
      
      if (success) {
        // Get the updated settings
        const updatedSettings = unifiedSettingsService.loadSettings();
        setSettings(updatedSettings);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: updatedSettings } 
        }));
        
        showNotification('Settings updated successfully', 'success');
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      console.error(`Error updating ${key} setting:`, error);
      showNotification('Error updating settings', 'error');
    }
  };

  // Handle reset settings
  const handleResetSettings = async () => {
    try {
      const success = await unifiedSettingsService.resetSettings();
      
      if (success) {
        // Get the default settings
        const defaultSettings = unifiedSettingsService.loadSettings();
        setSettings(defaultSettings);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: defaultSettings } 
        }));
        
        showNotification('Settings reset to defaults', 'success');
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Error resetting settings', 'error');
    }
  };

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Theme Setting */}
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Theme</FormLabel>
          <RadioGroup
            row
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <FormControlLabel value="light" control={<Radio />} label="Light" />
            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
            <FormControlLabel value="system" control={<Radio />} label="System Default" />
          </RadioGroup>
        </FormControl>

        {/* Font Size Setting */}
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Font Size</FormLabel>
          <RadioGroup
            row
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          >
            <FormControlLabel value="small" control={<Radio />} label="Small" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="large" control={<Radio />} label="Large" />
          </RadioGroup>
        </FormControl>

        {/* Presentation View Mode */}
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Presentation View Mode</FormLabel>
          <RadioGroup
            row
            value={settings.presentationViewMode}
            onChange={(e) => handleSettingChange('presentationViewMode', e.target.value)}
          >
            <FormControlLabel value="embed" control={<Radio />} label="Embedded Viewer" />
            <FormControlLabel value="download" control={<Radio />} label="Download File" />
          </RadioGroup>
        </FormControl>

        {/* Toggle Settings */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
            }
            label="Enable Notifications"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
            }
            label="Auto Save"
          />
        </Box>

        {/* Reset Button */}
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
        </Box>
      </Paper>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
