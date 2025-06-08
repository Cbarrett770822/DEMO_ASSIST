/**
 * Unified Settings Service
 * 
 * This service provides a single source of truth for application settings,
 * with proper integration with the authentication system.
 */

import config from '../config';

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  notifications: true,
  autoSave: true,
  presentationViewMode: 'embed',
  lastVisitedSection: null
};

// Storage keys
const SETTINGS_KEY = 'wms_settings';
const USER_SETTINGS_PREFIX = 'wms_user_settings_';

// In-memory cache of current settings
let currentSettings = { ...DEFAULT_SETTINGS };

/**
 * Set current settings in memory
 * @param {Object} settings - Settings object to set as current
 */
const setCurrentSettings = (settings) => {
  currentSettings = { ...settings };
  console.log('Current settings updated in memory');
};

/**
 * Get current settings from memory
 * @returns {Object} - Current settings
 */
export const getCurrentSettings = () => {
  return { ...currentSettings };
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} - Authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('wms_auth_token');
};

/**
 * Extract user ID from simplified token
 * @param {string} token - Token in format userId:username:role or dev-fallback-username
 * @returns {string|null} - User ID or null if not found/invalid
 */
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    
    // Check if it's our simplified token format (userId:username:role)
    if (token.includes(':')) {
      const parts = token.split(':');
      if (parts.length >= 1) {
        return parts[0]; // First part is userId
      }
    }
    
    // Check for development fallback tokens (legacy format)
    if (token.startsWith('dev-fallback-')) {
      console.log('Using development fallback token for user ID extraction');
      // Extract username from token if it's in the format 'dev-fallback-username'
      const parts = token.split('-');
      if (parts.length >= 3) {
        const username = parts[2];
        return `${username}-dev-id`; // username-dev-id format
      }
      return 'admin-dev-id'; // Default to admin for the old format
    }
    
    // For backward compatibility, try JWT token format
    if (token.split('.').length === 3) {
      try {
        // Decode the payload (middle part)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || null;
      } catch (jwtError) {
        console.warn('Error parsing JWT payload (legacy format):', jwtError);
        // Continue to try other formats
      }
    }
    
    console.warn('Could not extract user ID from token format:', token.substring(0, 10) + '...');
    return null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Get the current user ID from localStorage
 * @returns {string} - User ID or 'guest' if not authenticated
 */
const getCurrentUserId = () => {
  try {
    // First try to get from auth token
    const token = getAuthToken();
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) return userId;
    }
    
    // Fall back to user data in localStorage
    const userJson = localStorage.getItem('wms_current_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id || 'guest';
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
  return 'guest';
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
const isAuthenticated = () => {
  return localStorage.getItem('wms_auth_token') !== null;
};

/**
 * Get the storage key for user settings
 * @param {string} userId - User ID (optional, will use current user if not provided)
 * @returns {string} - Storage key
 */
const getUserSettingsKey = (userId = null) => {
  const id = userId || getCurrentUserId();
  return `${USER_SETTINGS_PREFIX}${id}`;
};

/**
 * Load settings from localStorage
 * @returns {Object} - Settings object
 */
export const loadSettings = () => {
  try {
    // Determine which settings to load based on authentication state
    if (isAuthenticated()) {
      const userId = getCurrentUserId();
      const userSettingsKey = getUserSettingsKey(userId);
      
      // Try to load user-specific settings
      const userSettingsJson = localStorage.getItem(userSettingsKey);
      if (userSettingsJson) {
        try {
          const userData = JSON.parse(userSettingsJson);
          if (userData.settings && typeof userData.settings === 'object') {
            console.log('Loaded user-specific settings for user:', userId);
            // Ensure theme is light
            userData.settings.theme = 'light';
            setCurrentSettings(userData.settings);
            return userData.settings;
          }
        } catch (parseError) {
          console.error('Error parsing user settings:', parseError);
        }
      }
    }
    
    // Fall back to global settings if no user settings or not authenticated
    const globalSettingsJson = localStorage.getItem(SETTINGS_KEY);
    if (globalSettingsJson) {
      try {
        const globalSettings = JSON.parse(globalSettingsJson);
        console.log('Loaded global settings');
        // Ensure theme is light
        globalSettings.theme = 'light';
        setCurrentSettings(globalSettings);
        return globalSettings;
      } catch (parseError) {
        console.error('Error parsing global settings:', parseError);
      }
    }
    
    // Return default settings if nothing else is available
    console.log('Using default settings');
    const defaultSettings = { ...DEFAULT_SETTINGS, theme: 'light' };
    setCurrentSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    const defaultSettings = { ...DEFAULT_SETTINGS, theme: 'light' };
    setCurrentSettings(defaultSettings);
    return defaultSettings;
  }
};

/**
 * Save settings to localStorage (global settings key)
 * @param {Object} settings - Settings to save
 * @returns {boolean} - True if successful, false otherwise
 */
export const saveSettingsToLocalStorage = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log('Saved settings to localStorage global key');
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
};

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings to save
 * @returns {boolean} - True if successful, false otherwise
 */
export const saveSettings = (settings) => {
  try {
    // Always merge with existing settings to avoid losing properties
    const existingSettings = getCurrentSettings();
    const mergedSettings = { ...existingSettings, ...settings };
    
    // Update in-memory settings cache
    setCurrentSettings(mergedSettings);
    
    // Save settings based on authentication state
    if (isAuthenticated()) {
      const userId = getCurrentUserId();
      const userSettingsKey = getUserSettingsKey(userId);
      
      // Save to user-specific storage
      localStorage.setItem(userSettingsKey, JSON.stringify({
        settings: mergedSettings,
        lastUpdated: new Date().toISOString()
      }));
      
      // Also save to server if online
      saveSettingsToServer(mergedSettings).catch(error => {
        console.warn('Failed to save settings to server:', error);
      });
      
      console.log('Saved user-specific settings for user:', userId);
    }
    
    // Always save to global settings as well for fallback
    saveSettingsToLocalStorage(mergedSettings);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('settings-loaded', { 
      detail: { settings: mergedSettings, source: 'save' } 
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Save settings to server
 * @param {Object} settings - Settings to save
 * @param {string} customToken - Optional custom token to use instead of localStorage token
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const saveSettingsToServer = async (settings, customToken = null) => {
  try {
    // Use provided token or get from localStorage
    const token = customToken || getAuthToken();
    if (!token) {
      console.log('No auth token available, using local storage only');
      // Still save to localStorage as fallback
      saveSettingsToLocalStorage(settings);
      return true;
    }

    // Extract user ID from token
    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.log('No user ID available from token, using local storage only');
      // Still save to localStorage as fallback
      saveSettingsToLocalStorage(settings);
      return true;
    }

    // Add metadata to help with conflict resolution and tracking
    const settingsToSave = {
      ...settings,
      _metadata: {
        lastSaved: new Date().toISOString(),
        userId,
        clientVersion: '1.0.0',
        tokenType: token.includes(':') ? 'simplified' : 'legacy'
      }
    };

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

    // Determine the appropriate endpoint
    const endpoint = isDevelopment ? 
      `${config.apiUrl}/save-user-settings` : 
      'https://wms-tutorial-app.netlify.app/.netlify/functions/save-user-settings';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          settings: settingsToSave
        })
      });
  
      if (!response.ok) {
        console.warn(`Server returned ${response.status} when saving settings, using local storage fallback`);
        // Still save to localStorage as fallback
        saveSettingsToLocalStorage(settings);
        return true;
      }
  
      const data = await response.json();
      console.log('Settings saved to server successfully:', data);
      
      // Also save to localStorage for offline access
      saveSettingsToLocalStorage(settings);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('settings-saved-to-server', { 
        detail: { settings: settingsToSave } 
      }));
      
      return true;
    } catch (fetchError) {
      console.warn('Failed to save settings to server, using local storage only:', fetchError.message);
      // Still save to localStorage as fallback
      saveSettingsToLocalStorage(settings);
      return true;
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    // Try to save to localStorage as last resort
    try {
      saveSettingsToLocalStorage(settings);
      return true;
    } catch (localError) {
      console.error('Failed to save settings to localStorage:', localError);
      return false;
    }
  }
};

/**
 * Load settings from server
 * @param {string} customToken - Optional custom token to use instead of localStorage token
 * @returns {Promise<Object|null>} - Settings object or null if not found/error
 */
export const loadSettingsFromServer = async (customToken = null) => {
  try {
    // Use provided token or get from localStorage
    const token = customToken || getAuthToken();
    if (!token) {
      console.log('No auth token available, using local storage only');
      return null;
    }

    // Extract user ID from token
    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.log('No user ID available from token, using local storage only');
      return null;
    }

    console.log('Loading settings from server for user:', userId);

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

    // Determine the appropriate endpoint
    const endpoint = isDevelopment ? 
      `${config.apiUrl}/get-user-settings` : 
      'https://wms-tutorial-app.netlify.app/.netlify/functions/get-user-settings';

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn(`Server returned ${response.status} when loading settings, using local storage fallback`);
        return null;
      }

      const data = await response.json();
      
      if (data.settings && typeof data.settings === 'object') {
        console.log('Settings loaded from server successfully');
        // Update in-memory settings cache
        setCurrentSettings(data.settings);
        
        // Save the server settings to localStorage for offline access
        const userKey = getUserSettingsKey(userId);
        try {
          localStorage.setItem(userKey, JSON.stringify({
            settings: data.settings,
            lastUpdated: new Date().toISOString(),
            source: 'server'
          }));
          console.log('Server settings saved to localStorage for offline access');
        } catch (storageError) {
          console.warn('Failed to save server settings to localStorage:', storageError);
        }
        
        return data.settings;
      } else {
        console.warn('Invalid settings format from server, using local storage fallback');
        return null;
      }
    } catch (fetchError) {
      console.warn('Failed to fetch settings from server, using local storage only:', fetchError.message);
      return null;
    }
  } catch (error) {
    console.error('Error loading settings from server:', error);
    return null;
  }
};

/**
 * Initialize settings
 * @returns {Promise<Object>} - Settings object
 */
export const initSettings = async () => {
  try {
    // First try to load from localStorage
    const localSettings = loadSettings();
    
    // Ensure theme is set to light
    localSettings.theme = 'light';
    
    setCurrentSettings(localSettings);
    
    // If authenticated, try to load from server
    if (isAuthenticated()) {
      try {
        const serverSettings = await loadSettingsFromServer();
        if (serverSettings) {
          // Ensure theme is set to light
          serverSettings.theme = 'light';
          
          setCurrentSettings(serverSettings);
          saveSettingsToLocalStorage(serverSettings);
        }
      } catch (serverError) {
        console.warn('Failed to load settings from server:', serverError);
        // Continue with local settings
      }
    }
    
    // Save the settings with light theme to ensure persistence
    const currentSettings = getCurrentSettings();
    saveSettings(currentSettings);
    
    return currentSettings;
  } catch (error) {
    console.error('Error initializing settings:', error);
    const defaultSettings = { ...DEFAULT_SETTINGS, theme: 'light' };
    return defaultSettings;
  }
};

/**
 * Get a specific setting
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if setting not found
 * @returns {any} - Setting value
 */
export const getSetting = (key, defaultValue = null) => {
  const settings = loadSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
};

/**
 * Update a specific setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {boolean} - True if successful, false otherwise
 */
export const updateSetting = (key, value) => {
  const settings = loadSettings();
  settings[key] = value;
  return saveSettings(settings);
};

/**
 * Reset settings to defaults
 * @returns {boolean} - True if successful, false otherwise
 */
export const resetSettings = () => {
  return saveSettings({ ...DEFAULT_SETTINGS });
};

/**
 * Clear settings
 * @returns {boolean} - True if successful, false otherwise
 */
export const clearSettings = () => {
  try {
    if (isAuthenticated()) {
      const userId = getCurrentUserId();
      const userSettingsKey = getUserSettingsKey(userId);
      localStorage.removeItem(userSettingsKey);
    }
    
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing settings:', error);
    return false;
  }
};

/**
 * Handle user login - load settings for the user
 * @param {string|Object} userOrId - User object or userId string
 * @param {string} token - Authentication token (optional)
 */
export const handleUserLogin = async (userOrId, token = null) => {
  try {
    // Handle both object and string formats for user parameter
    let userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
    
    console.log('Handling settings for user login:', userId);
    if (!userId) {
      console.warn('No valid user ID provided to handleUserLogin');
      return;
    }
    
    // First, try to load user-specific settings from localStorage
    // Support both formats for backward compatibility
    const userKey = `${USER_SETTINGS_PREFIX}${userId}`;
    const legacyUserKey = `wms_settings_${userId}`;
    let userSettings = null;
    
    try {
      // Try new format first
      let storedSettings = localStorage.getItem(userKey);
      
      // If not found, try legacy format
      if (!storedSettings) {
        storedSettings = localStorage.getItem(legacyUserKey);
        if (storedSettings) {
          console.log('Found settings in legacy format, will migrate to new format');
        }
      }
      
      if (storedSettings) {
        // Handle both direct settings and {settings} object format
        try {
          const parsed = JSON.parse(storedSettings);
          userSettings = parsed.settings || parsed;
          console.log('Loaded user-specific settings from localStorage for user:', userId);
        } catch (parseError) {
          console.warn('Error parsing user settings JSON:', parseError);
        }
      }
    } catch (localError) {
      console.warn('Error loading user settings from localStorage:', localError);
    }
    
    // If we have user settings in localStorage, use those immediately
    if (userSettings) {
      setCurrentSettings(userSettings);
      
      // Notify components that settings have been loaded
      window.dispatchEvent(new CustomEvent('settings-loaded', { 
        detail: { settings: userSettings, source: 'localStorage' } 
      }));
    }
    
    // In parallel, try to load settings from server
    try {
      // If token wasn't provided, try to get it from localStorage
      const authToken = token || getAuthToken();
      
      let serverSettings = null;
      if (authToken) {
        // Try to load settings from server using the provided or stored token
        const response = await fetch(`${config.apiUrl}/get-user-settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.settings && typeof data.settings === 'object') {
            serverSettings = data.settings;
            console.log('Successfully loaded settings from server for user:', userId);
          }
        } else {
          console.warn(`Server returned ${response.status} when loading settings, using localStorage fallback`);
        }
      }
      
      if (serverSettings) {
        console.log('Using settings from server for user:', userId);
        setCurrentSettings(serverSettings);
        
        // Save server settings to localStorage for offline access using the new format
        try {
          localStorage.setItem(userKey, JSON.stringify({
            settings: serverSettings,
            lastUpdated: new Date().toISOString(),
            source: 'server'
          }));
          
          // Clean up legacy format if it exists
          if (localStorage.getItem(legacyUserKey)) {
            localStorage.removeItem(legacyUserKey);
          }
        } catch (saveError) {
          console.warn('Error saving server settings to localStorage:', saveError);
        }
        
        // Notify components that settings have been updated from server
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: serverSettings, source: 'server' } 
        }));
      } else if (!userSettings) {
        // If no settings found anywhere, create default settings
        console.log('No settings found, creating defaults for user:', userId);
        const defaultSettings = { ...DEFAULT_SETTINGS };
        setCurrentSettings(defaultSettings);
        
        // Save default settings to localStorage using the new format
        try {
          localStorage.setItem(userKey, JSON.stringify({
            settings: defaultSettings,
            lastUpdated: new Date().toISOString(),
            source: 'default'
          }));
          
          // Clean up legacy format if it exists
          if (localStorage.getItem(legacyUserKey)) {
            localStorage.removeItem(legacyUserKey);
          }
        } catch (saveError) {
          console.warn('Error saving default settings to localStorage:', saveError);
        }
        
        // Try to save to server as well if we have a token
        if (authToken) {
          saveSettingsToServer(defaultSettings).catch(error => {
            console.warn('Error saving default settings to server:', error);
          });
        }
        
        // Notify components that default settings have been created
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: defaultSettings, source: 'default' } 
        }));
      }
    } catch (serverError) {
      console.error('Error loading settings from server:', serverError);
      
      // If we don't have user settings yet, create defaults
      if (!userSettings) {
        console.log('Server error, creating default settings for user:', userId);
        const defaultSettings = { ...DEFAULT_SETTINGS };
        setCurrentSettings(defaultSettings);
        
        // Save default settings to localStorage using the new format
        try {
          localStorage.setItem(userKey, JSON.stringify({
            settings: defaultSettings,
            lastUpdated: new Date().toISOString(),
            source: 'default-fallback'
          }));
          
          // Clean up legacy format if it exists
          if (localStorage.getItem(legacyUserKey)) {
            localStorage.removeItem(legacyUserKey);
          }
        } catch (saveError) {
          console.warn('Error saving default settings to localStorage:', saveError);
        }
        
        // Notify components that default settings have been created
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: defaultSettings, source: 'default-fallback' } 
        }));
      } else {
        // If we have user settings from localStorage, use those
        setCurrentSettings(userSettings);
        
        // Notify components that settings have been loaded from localStorage
        window.dispatchEvent(new CustomEvent('settings-loaded', { 
          detail: { settings: userSettings, source: 'localStorage-fallback' } 
        }));
      }
    }
  } catch (error) {
    console.error('Error handling user login settings:', error);
    // Fallback to default settings
    const defaultSettings = { ...DEFAULT_SETTINGS };
    setCurrentSettings(defaultSettings);
    
    // Notify components that default settings have been created due to error
    window.dispatchEvent(new CustomEvent('settings-loaded', { 
      detail: { settings: defaultSettings, source: 'error-fallback' } 
    }));
  }
};

/**
 * Handle user logout - save settings before logout
 * @param {string|Object} userOrId - User object or userId string (optional)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const handleUserLogout = async (userOrId = null) => {
  try {
    console.log('Handling settings for user logout');
    
    // Get current settings before logout
    const currentSettings = loadSettings();
    
    // Get user ID from parameter or from current context
    let userId = null;
    if (userOrId) {
      userId = typeof userOrId === 'string' ? userOrId : userOrId?.id;
    } else {
      userId = getCurrentUserId();
    }
    
    if (userId && userId !== 'guest') {
      console.log('Saving settings for user before logout:', userId);
      
      // Save current settings to user-specific key as backup
      const userLogoutKey = getUserSettingsKey(userId);
      localStorage.setItem(userLogoutKey, JSON.stringify({
        settings: currentSettings,
        lastUpdated: new Date().toISOString(),
        source: 'logout-backup'
      }));
      
      // Try to save to server before logging out
      try {
        const token = getAuthToken();
        if (token) {
          await saveSettingsToServer(currentSettings);
          console.log('Settings saved to server before logout');
        } else {
          console.log('No auth token available, skipping server save before logout');
        }
      } catch (serverError) {
        console.warn('Failed to save settings to server before logout:', serverError);
        // Continue with logout process even if server save fails
      }
    }
    
    // Preserve global settings for guest users instead of resetting to defaults
    // This ensures settings persistence across login/logout cycles
    const settingsToKeep = { ...currentSettings };
    
    // Store the settings in the global key for persistence
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToKeep));
    
    // Notify components that settings have been preserved
    window.dispatchEvent(new CustomEvent('settings-loaded', { 
      detail: { settings: settingsToKeep, source: 'logout-preserve' } 
    }));
    
    console.log('Settings preserved after logout');
    return true;
  } catch (error) {
    console.error('Error handling user logout settings:', error);
    return false;
  }
};

// Export convenience methods for specific settings
export const getTheme = () => getSetting('theme', 'light');
export const setTheme = (theme) => updateSetting('theme', theme);

export const getFontSize = () => getSetting('fontSize', 'medium');
export const setFontSize = (size) => updateSetting('fontSize', size);

export const getNotifications = () => getSetting('notifications', true);
export const setNotifications = (enabled) => updateSetting('notifications', enabled);

export const getAutoSave = () => getSetting('autoSave', true);
export const setAutoSave = (enabled) => updateSetting('autoSave', enabled);

export const getPresentationViewMode = () => getSetting('presentationViewMode', 'embed');
export const setPresentationViewMode = (mode) => updateSetting('presentationViewMode', mode);

export const getLastVisitedSection = () => getSetting('lastVisitedSection', null);
export const setLastVisitedSection = (sectionId) => updateSetting('lastVisitedSection', sectionId);

// Export default settings for reference
export const getDefaultSettings = () => ({ ...DEFAULT_SETTINGS });
