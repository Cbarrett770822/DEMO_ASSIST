/**
 * Settings Service
 * 
 * This service provides functions to manage application settings,
 * including user-specific settings that persist across sessions.
 */

import { saveSettings, loadSettings, hasStoredSettings, clearSettings } from './storageService';
import { getCurrentUser } from './auth/authService';
import { isAuthenticated } from './storageService';
import config from '../config';

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  notifications: true,
  autoSave: true,
  presentationViewMode: 'embed', // 'embed' or 'download'
  lastVisitedSection: null
};

/**
 * Initialize settings
 * @returns {Promise<Object>} - Settings object
 */
export const initSettings = async () => {
  console.log('Initializing settings...');
  let settingsToUse = null;
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    const currentUser = getCurrentUser();
    console.log('User is authenticated:', currentUser?.id);
    
    if (currentUser) {
      const userId = currentUser.id;
      const token = localStorage.getItem('wms_auth_token');
      
      // Try to load settings from the database first if we have a valid token
      if (token) {
        try {
          console.log('Attempting to load settings from database...');
          const endpoint = `${config.apiUrl}/get-user-settings`;
          
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.settings) {
              settingsToUse = data.settings;
              console.log('Successfully loaded settings from database:', settingsToUse);
              
              // Save to localStorage as a backup
              localStorage.setItem(`wms_user_settings_${userId}`, JSON.stringify({
                settings: settingsToUse,
                lastUpdated: new Date().toISOString()
              }));
            } else {
              console.log('No settings found in database response:', data);
            }
          } else {
            console.warn(`Database fetch failed with status: ${response.status}`);
          }
        } catch (dbError) {
          console.error('Error fetching settings from database:', dbError);
        }
      }
      
      // If database fetch fails, try localStorage
      if (!settingsToUse) {
        console.log('Falling back to localStorage for settings');
        
        // Try multiple sources for user settings in order of preference
        try {
          // 1. First try to load from user-specific key in localStorage
          const userSettingsKey = `wms_user_settings_${userId}`;
          const userSettingsData = localStorage.getItem(userSettingsKey);
          
          if (userSettingsData) {
            try {
              const userData = JSON.parse(userSettingsData);
              if (userData.settings) {
                console.log('Found user-specific settings in localStorage:', userData.settings);
                settingsToUse = userData.settings;
              } else if (typeof userData === 'object' && !Array.isArray(userData)) {
                // The settings might be stored directly without a settings property
                console.log('Found direct settings object in user storage:', userData);
                settingsToUse = userData;
              }
            } catch (parseError) {
              console.error('Error parsing user settings data:', parseError);
            }
          }
          
          // 2. If no settings found yet, try backup key
          if (!settingsToUse) {
            const backupKey = `wms_user_backup_${userId}`;
            const backupData = localStorage.getItem(backupKey);
            
            if (backupData) {
              try {
                const backupSettings = JSON.parse(backupData);
                if (backupSettings.settings) {
                  console.log('Found settings in backup storage:', backupSettings.settings);
                  settingsToUse = backupSettings.settings;
                }
              } catch (parseError) {
                console.error('Error parsing backup settings data:', parseError);
              }
            }
          }
        } catch (error) {
          console.error('Error loading user settings from localStorage:', error);
        }
      }
    }
  }
  
  // If no user-specific settings found, try to load global settings
  if (!settingsToUse) {
    console.log('Attempting to load global settings...');
    try {
      const globalSettingsData = localStorage.getItem('wms_settings');
      if (globalSettingsData) {
        settingsToUse = JSON.parse(globalSettingsData);
        console.log('Found global settings:', settingsToUse);
      }
    } catch (error) {
      console.error('Error loading global settings:', error);
    }
  }
  
  // If still no settings found anywhere, use defaults
  if (!settingsToUse) {
    console.log('No settings found, using defaults');
    settingsToUse = DEFAULT_SETTINGS;
  }
  
  // Save the settings to all storage locations for consistency
  console.log('Saving settings to all storage locations:', settingsToUse);
  
  try {
    // Use our improved saveSettings function which handles both database and localStorage
    await saveSettings(settingsToUse, isAuthenticated());
    console.log('Settings saved successfully to all storage locations');
  } catch (error) {
    console.error('Error saving settings during initialization:', error);
  }
  
  return settingsToUse;
};

/**
 * Get all settings
 * @returns {Object} - Settings object
 */
export const getSettings = () => {
  const settings = loadSettings(true);
  if (!settings) {
    console.log('No settings found in getSettings, using defaults');
    return DEFAULT_SETTINGS;
  }
  return settings;
};

/**
 * Get a specific setting
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if setting not found
 * @returns {any} - Setting value
 */
export const getSetting = (key, defaultValue = null) => {
  const settings = getSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
};

/**
 * Update settings
 * @param {Object} newSettings - New settings object or partial settings
 * @returns {Promise<Object>} - Updated settings object
 */
export const updateSettings = async (newSettings) => {
  console.log('Updating settings:', newSettings);
  let updatedSettings = { ...newSettings };
  
  try {
    // Get current settings
    const currentSettings = await getSettings();
    
    // Merge with new settings
    updatedSettings = { ...currentSettings, ...newSettings };
    
    // Save to localStorage
    saveSettings(updatedSettings, true);
    
    // If user is authenticated, also save to database
    if (isAuthenticated()) {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const userSettingsKey = `wms_user_settings_${currentUser.id}`;
          
          // Get existing user data if available
          let existingUserData = {};
          try {
            const existingData = localStorage.getItem(userSettingsKey);
            if (existingData) {
              existingUserData = JSON.parse(existingData);
            }
          } catch (parseError) {
            console.error('Error parsing existing user data:', parseError);
          }
          
          // Update settings in user data
          const updatedUserData = { ...existingUserData, settings: updatedSettings };
          localStorage.setItem(userSettingsKey, JSON.stringify(updatedUserData));
          console.log('Saved settings to user-specific key');
          
          // Create a backup copy
          const backupKey = `wms_user_backup_${currentUser.id}`;
          localStorage.setItem(backupKey, JSON.stringify(updatedUserData));
          console.log('Created backup copy of settings');
          
          // Try to save to server as well
          try {
            await saveUserSettingsToServer(updatedSettings);
            console.log('Saved settings to server');
          } catch (serverError) {
            console.error('Error saving settings to server (non-critical):', serverError);
          }
        }
      } catch (error) {
        console.error('Error saving user-specific settings:', error);
      }
    }
  } catch (error) {
    console.error('Error updating settings:', error);
  }
  
  return updatedSettings;
};

/**
 * Update a specific setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Object} - Updated settings object
 */
export const updateSetting = (key, value) => {
  return updateSettings({ [key]: value });
};

/**
 * Reset settings to defaults
 * @returns {Object} - Default settings object
 */
export const resetSettings = () => {
  saveSettings(DEFAULT_SETTINGS, true);
  return DEFAULT_SETTINGS;
};

/**
 * Clear all settings
 * @returns {boolean} - True if successful
 */
export const clearAllSettings = () => {
  return clearSettings(true);
};

/**
 * Get the current user's settings
 * This is useful when you need to access settings after a user logs in
 * @returns {Promise<Object>} - User settings
 */
export const getCurrentUserSettings = async () => {
  console.log('Getting current user settings...');
  let settingsToUse = null;
  
  // If user is authenticated, try multiple sources
  if (isAuthenticated()) {
    const currentUser = getCurrentUser();
    console.log('User is authenticated:', currentUser?.id);
    
    if (currentUser) {
      const userId = currentUser.id;
      
      // Try multiple sources for user settings in order of preference
      try {
        // 1. First try to load from user-specific key in localStorage
        const userSettingsKey = `wms_user_settings_${userId}`;
        const userSettingsData = localStorage.getItem(userSettingsKey);
        
        if (userSettingsData) {
          try {
            const userData = JSON.parse(userSettingsData);
            if (userData.settings) {
              console.log('Found user-specific settings in localStorage:', userData.settings);
              settingsToUse = userData.settings;
            } else if (typeof userData === 'object' && !Array.isArray(userData)) {
              console.log('Found direct settings object in user storage:', userData);
              settingsToUse = userData;
            }
          } catch (parseError) {
            console.error('Error parsing user settings data:', parseError);
          }
        }
        
        // 2. If no settings found yet, try backup key
        if (!settingsToUse) {
          const backupKey = `wms_user_backup_${userId}`;
          const backupData = localStorage.getItem(backupKey);
          
          if (backupData) {
            try {
              const backupSettings = JSON.parse(backupData);
              if (backupSettings.settings) {
                console.log('Found settings in backup storage:', backupSettings.settings);
                settingsToUse = backupSettings.settings;
              }
            } catch (parseError) {
              console.error('Error parsing backup settings data:', parseError);
            }
          }
        }
        
        // 3. If still no settings, try user-specific settings from storage service
        if (!settingsToUse) {
          const userSpecificSettings = loadSettings(true);
          if (userSpecificSettings) {
            console.log('Found user-specific settings in storage service:', userSpecificSettings);
            settingsToUse = userSpecificSettings;
          }
        }
        
        // 4. If still no settings, try to load from server
        if (!settingsToUse) {
          console.log('Attempting to load settings from server...');
          const serverSettings = await fetchUserSettings();
          if (serverSettings) {
            console.log('Loaded settings from server:', serverSettings);
            settingsToUse = serverSettings;
            
            // Save to all storage locations for future use
            saveSettings(serverSettings, true); // User-specific
            saveSettings(serverSettings, false); // Global
            // Use our own function instead of the removed saveUserSettings from authService
            saveUserSettingsToServer(serverSettings); // Save to server
            
            // Also save to user-specific key
            localStorage.setItem(userSettingsKey, JSON.stringify({ settings: serverSettings }));
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    }
  }
  
  // 5. If no user-specific settings found, try to load global settings
  if (!settingsToUse) {
    console.log('Attempting to load global settings...');
    const globalSettings = loadSettings(false);
    
    if (globalSettings) {
      console.log('Found global settings:', globalSettings);
      settingsToUse = globalSettings;
    }
  }
  
  // 6. If still no settings found anywhere, use defaults
  if (!settingsToUse) {
    console.log('No settings found, using defaults');
    settingsToUse = DEFAULT_SETTINGS;
  }
  
  return settingsToUse;
};

/**
 * Save the last visited section
 * @param {string} sectionId - Section ID
 * @returns {Object} - Updated settings
 */
export const saveLastVisitedSection = (sectionId) => {
  return updateSetting('lastVisitedSection', sectionId);
};

/**
 * Get the last visited section
 * @returns {string|null} - Section ID or null
 */
export const getLastVisitedSection = () => {
  return getSetting('lastVisitedSection', null);
};

/**
 * Set presentation view mode preference
 * @param {string} mode - View mode ('embed' or 'download')
 * @returns {Object} - Updated settings
 */
export const setPresentationViewMode = (mode) => {
  return updateSetting('presentationViewMode', mode);
};

/**
 * Get presentation view mode preference
 * @returns {string} - View mode ('embed' or 'download')
 */
export const getPresentationViewMode = () => {
  return getSetting('presentationViewMode', 'embed');
};

/**
 * Fetch user settings from the server
 * @returns {Promise<Object|null>} - User settings or null if not found
 */
export const fetchUserSettings = async () => {
  try {
    const token = localStorage.getItem('wms_auth_token');
    if (!token) return null;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    console.log('Fetching settings for user:', currentUser.id);
    
    // Log the token being sent for debugging
    console.log('Sending token:', token.substring(0, 10) + '...');
    
    const response = await fetch(`${config.apiUrl}/get-user-settings`, {
      method: 'GET',
      headers: {
        // Send token directly without Bearer prefix to match server expectations
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch user settings: ${response.status}`);
      
      // Try to load from localStorage as fallback
      const userSettingsKey = `wms_user_settings_${currentUser.id}`;
      const localData = localStorage.getItem(userSettingsKey);
      
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          if (parsedData.settings) {
            console.log('Using cached settings from localStorage');
            return parsedData.settings;
          }
        } catch (parseError) {
          console.error('Error parsing local settings:', parseError);
        }
      }
      
      throw new Error('Failed to fetch user settings');
    }
    
    const data = await response.json();
    if (data.settings) {
      // Cache the settings in localStorage
      localStorage.setItem(`wms_user_settings_${currentUser.id}`, JSON.stringify({
        settings: data.settings,
        lastUpdated: new Date().toISOString()
      }));
    }
    
    return data.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

/**
 * Save user settings to the server
 * @param {Object} settings - Settings object
 * @returns {Promise<boolean>} - True if successful
 */
export const saveUserSettingsToServer = async (settings) => {
  try {
    const token = localStorage.getItem('wms_auth_token');
    if (!token) return false;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    console.log('Saving settings to server for user:', currentUser.id);
    
    // Log the token being sent for debugging
    console.log('Saving settings - token:', token.substring(0, 10) + '...');
    
    const response = await fetch(`${config.apiUrl}/save-user-settings`, {
      method: 'POST',
      headers: {
        // Send token directly without Bearer prefix to match server expectations
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ settings })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error saving settings:', errorData);
      
      // Save to localStorage as backup even if server save fails
      localStorage.setItem(`wms_user_settings_${currentUser.id}`, JSON.stringify({
        settings,
        lastUpdated: new Date().toISOString(),
        serverSaveFailed: true
      }));
      
      throw new Error(`Failed to save user settings: ${response.status}`);
    }
    
    // Update the timestamp in localStorage
    localStorage.setItem(`wms_user_settings_${currentUser.id}`, JSON.stringify({
      settings,
      lastUpdated: new Date().toISOString(),
      serverSaveSucceeded: true
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving user settings to server:', error);
    return false;
  }
};
