/**
 * Storage Service
 * 
 * This service provides functions to save and load data to/from localStorage.
 * It's used to persist video assignments, presentations, and settings between app sessions.
 */

// Service for storing and retrieving data from localStorage
import config from '../config';

// Keys for storing data in localStorage
const PROCESS_DATA_KEY = 'wms_process_data';
const PRESENTATIONS_KEY = 'wms_presentations';
const NOTES_KEY = 'wms_voice_notes';
const SETTINGS_KEY = 'wms_settings';
const USER_SETTINGS_PREFIX = 'wms_user_settings_';
const AUTH_TOKEN_KEY = 'wms_auth_token';
const CURRENT_USER_KEY = 'wms_current_user';

// Get the current user ID from localStorage
export const getCurrentUserId = () => {
  try {
    // Use the correct key for the current user
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id || 'guest';
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
  return 'guest';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('wms_auth_token') !== null;
};

// Get the storage key for the current user's settings
export const getUserSettingsKey = () => {
  const userId = getCurrentUserId();
  console.log('Getting settings key for user ID:', userId);
  return `${USER_SETTINGS_PREFIX}${userId}`;
};

/**
 * Helper function to safely convert potentially proxy objects to plain objects
 * @param {Object} obj - Object that might be a proxy
 * @returns {Object} - Plain JavaScript object
 */
const safelyUnproxy = (obj) => {
  if (!obj) return obj;
  
  try {
    // For primitive values, just return them
    if (typeof obj !== 'object' || obj === null) return obj;
    
    // For arrays, map each item
    if (Array.isArray(obj)) {
      return obj.map(item => safelyUnproxy(item));
    }
    
    // For objects, create a new object with all properties
    const result = {};
    // Only get own enumerable properties
    const keys = Object.keys(obj);
    for (const key of keys) {
      try {
        // Skip functions and symbols
        const val = obj[key];
        if (typeof val !== 'function' && typeof val !== 'symbol') {
          result[key] = safelyUnproxy(val);
        }
      } catch (err) {
        // If accessing a property fails (e.g., revoked proxy), skip it
        console.warn(`Skipping property ${key} due to access error`);
      }
    }
    return result;
  } catch (err) {
    console.warn('Error in safelyUnproxy:', err);
    // Return a minimal object if we can get the id and title/name
    try {
      return {
        id: obj.id || 'unknown',
        title: obj.title || obj.name || 'Untitled',
      };
    } catch {
      return { id: 'unknown', title: 'Error Processing Item' };
    }
  }
};

/**
 * Save processes data to database
 * @param {Array} processes - Array of process objects
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const saveProcesses = async (processes) => {
  // First create a safe copy of the processes array
  let safeProcesses;
  try {
    // Make a defensive copy early to avoid proxy issues
    safeProcesses = Array.isArray(processes) ? 
      processes.map(process => safelyUnproxy(process)) : 
      [];
      
    if (safeProcesses.length === 0 && processes) {
      console.warn('No processes found in the array or processes is not an array');
    }
  } catch (copyError) {
    console.error('Error creating safe copy of processes:', copyError);
    safeProcesses = [];
  }
  
  try {
    // First save to database
    const response = await fetch(`${config.apiUrl}/saveProcesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
      },
      body: JSON.stringify({ processes: safeProcesses })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save processes to database: ${response.status}`);
    }
    
    // Also cache in localStorage
    localStorage.setItem(PROCESS_DATA_KEY, JSON.stringify(safeProcesses));
    console.log('Successfully saved processes to database and localStorage');
    return true;
  } catch (error) {
    console.error('Error saving processes to database:', error);
    
    // Still try to save to localStorage as a fallback
    try {
      localStorage.setItem(PROCESS_DATA_KEY, JSON.stringify(safeProcesses));
      console.log('Saved processes to localStorage as fallback');
      return true;
    } catch (localError) {
      console.error('Error saving processes to localStorage:', localError);
      return false;
    }
  }
};

/**
 * Load processes data from database
 * @returns {Promise<Array|null>} - Array of process objects or null if not found
 */
export const loadProcesses = async () => {
  try {
    // First try to get data from the database
    const response = await fetch(`${config.apiUrl}/getProcesses`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.processes) {
        // Cache the data in localStorage
        localStorage.setItem(PROCESS_DATA_KEY, JSON.stringify(data.processes));
        return data.processes;
      }
    }
    
    // Fall back to localStorage only if database fetch fails
    const cachedData = localStorage.getItem(PROCESS_DATA_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error loading processes from database:', error);
    // Fall back to localStorage
    const cachedData = localStorage.getItem(PROCESS_DATA_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  }
};

/**
 * Synchronously load processes data from localStorage
 * @returns {Array|null} - Array of process objects or null if not found
 */
export const loadProcessesSync = () => {
  try {
    const cachedData = localStorage.getItem(PROCESS_DATA_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error loading processes from localStorage:', error);
    return null;
  }
};



/**
 * Check if processes data exists in localStorage
 * @returns {boolean} - True if processes data exists, false otherwise
 */
export const hasStoredProcesses = () => {
  return localStorage.getItem(PROCESS_DATA_KEY) !== null;
};

/**
 * Clear processes data from localStorage
 */
export const clearProcesses = () => {
  try {
    localStorage.removeItem(PROCESS_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing processes from localStorage:', error);
    return false;
  }
};

/**
 * Save presentations data to database
 * @param {Array} presentations - Array of presentation objects
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const savePresentations = async (presentations) => {
  // First create a safe copy of the presentations array
  let safePresentations;
  try {
    // Make a defensive copy early to avoid proxy issues
    safePresentations = Array.isArray(presentations) ? 
      presentations.map(presentation => safelyUnproxy(presentation)) : 
      [];
      
    if (safePresentations.length === 0 && presentations) {
      console.warn('No presentations found in the array or presentations is not an array');
    }
  } catch (copyError) {
    console.error('Error creating safe copy of presentations:', copyError);
    safePresentations = [];
  }
  
  try {
    // First save to database
    const response = await fetch(`${config.apiUrl}/savePresentations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
      },
      body: JSON.stringify({ presentations: safePresentations })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save presentations to database: ${response.status}`);
    }
    
    // Also cache in localStorage
    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(safePresentations));
    console.log('Successfully saved presentations to database and localStorage');
    return true;
  } catch (error) {
    console.error('Error saving presentations to database:', error);
    
    // Still try to save to localStorage as a fallback
    try {
      localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(safePresentations));
      console.log('Saved presentations to localStorage as fallback');
      return true;
    } catch (localError) {
      console.error('Error saving presentations to localStorage:', localError);
      return false;
    }
  }
};

/**
 * Load presentations data from database
 * @returns {Promise<Array|null>} - Array of presentation objects or null if not found
 */
export const loadPresentations = async () => {
  try {
    // First try to get data from the database
    const response = await fetch(`${config.apiUrl}/getPresentations`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.presentations) {
        // Cache the data in localStorage
        localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(data.presentations));
        return data.presentations;
      }
    }
    
    // Fall back to localStorage only if database fetch fails
    const cachedData = localStorage.getItem(PRESENTATIONS_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error loading presentations from database:', error);
    // Fall back to localStorage
    const cachedData = localStorage.getItem(PRESENTATIONS_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  }
};

/**
 * Synchronously load presentations data from localStorage
 * @returns {Array|null} - Array of presentation objects or null if not found
 */
export const loadPresentationsSync = () => {
  try {
    const cachedData = localStorage.getItem(PRESENTATIONS_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error loading presentations from localStorage:', error);
    return null;
  }
};



/**
 * Check if presentations data exists in localStorage
 * @returns {boolean} - True if presentations data exists, false otherwise
 */
export const hasStoredPresentations = () => {
  return localStorage.getItem(PRESENTATIONS_KEY) !== null;
};

/**
 * Clear presentations data from localStorage
 */
export const clearPresentations = () => {
  try {
    localStorage.removeItem(PRESENTATIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing presentations from localStorage:', error);
    return false;
  }
};

/**
 * Save voice notes to localStorage
 * @param {Array} notes - Array of note objects
 */
export const saveNotes = (notes) => {
  try {
    // We need to serialize the audio blobs to store them
    const serializableNotes = notes.map(note => {
      // Create a new object without the audioBlob property
      const { audioBlob, ...noteWithoutAudio } = note;
      return noteWithoutAudio;
    });
    
    localStorage.setItem(NOTES_KEY, JSON.stringify(serializableNotes));
    return true;
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
    return false;
  }
};

/**
 * Load voice notes from localStorage
 * @returns {Array|null} - Array of note objects or null if not found
 */
export const loadNotes = () => {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return null;
  }
};

/**
 * Check if voice notes exist in localStorage
 * @returns {boolean} - True if notes exist, false otherwise
 */
export const hasStoredNotes = () => {
  return localStorage.getItem(NOTES_KEY) !== null;
};

/**
 * Clear voice notes from localStorage
 */
export const clearNotes = () => {
  try {
    localStorage.removeItem(NOTES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notes from localStorage:', error);
    return false;
  }
};

/**
 * Save settings to database
 * @param {Object} settings - Settings object
 * @param {boolean} isUserSpecific - Whether the settings are user-specific
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const saveSettings = async (settings, isUserSpecific = true) => {
  try {
    if (!settings) {
      console.error('Cannot save null or undefined settings');
      return false;
    }
    
    console.log('Saving settings to database, isUserSpecific:', isUserSpecific);
    const userId = getCurrentUserId();
    const token = localStorage.getItem('wms_auth_token');
    
    // First save to database if we have a valid token
    if (token) {
      try {
        const endpoint = isUserSpecific ? 
          `${config.apiUrl}/save-user-settings` : 
          `${config.apiUrl}/saveSettings`;
        
        const payload = isUserSpecific ? 
          { settings, userId } : 
          { settings };
        
        console.log(`Saving settings to endpoint: ${endpoint}`);
        console.log('Settings payload:', payload);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to save settings to database: ${response.status} - ${errorText}`);
        }
        
        console.log('Successfully saved settings to database');
      } catch (dbError) {
        console.error('Error saving settings to database:', dbError);
        // Continue to save to localStorage even if database save fails
      }
    } else {
      console.log('No auth token available, skipping database save');
    }
    
    // Save to all localStorage locations using our helper function
    await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
    
    console.log('Settings saved successfully to all storage locations');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Load settings from database
 * @param {boolean} isUserSpecific - Whether to load user-specific settings
 * @returns {Promise<Object|null>} - Settings object or null if not found
 */
export const loadSettings = async (isUserSpecific = true) => {
  try {
    let settings = null;
    const userId = getCurrentUserId();
    const token = localStorage.getItem('wms_auth_token');
    
    console.log('Loading settings from database, isUserSpecific:', isUserSpecific, 'User ID:', userId);
    
    // First try to get settings from the database if we have a valid token
    if (token) {
      try {
        const endpoint = isUserSpecific ? 
          `${config.apiUrl}/getUserSettings?userId=${userId}` : 
          `${config.apiUrl}/getSettings`;
        
        console.log(`Fetching settings from endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.settings) {
            settings = data.settings;
            console.log('Successfully loaded settings from database:', settings);
            
            // Cache the settings in all localStorage locations for redundancy
            await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
            
            return settings;
          } else {
            console.log('No settings found in database response:', data);
          }
        } else {
          console.warn(`Database fetch failed with status: ${response.status}`);
        }
      } catch (dbError) {
        console.error('Error fetching settings from database:', dbError);
      }
    } else {
      console.log('No auth token available, skipping database fetch');
    }
    
    // If database fetch fails or no token, fall back to localStorage
    // Try multiple sources for settings in order of preference
    console.log('Falling back to localStorage for settings');
    
    // Try to load user-specific settings first if requested and user is authenticated
    if (isUserSpecific && isAuthenticated() && userId !== 'guest') {
      console.log('Attempting to load user-specific settings for user:', userId);
      
      // 1. First check the user-specific settings key (most reliable)
      const userSettingsKey = getUserSettingsKey();
      const userSettingsData = localStorage.getItem(userSettingsKey);
      if (userSettingsData) {
        try {
          const parsedData = JSON.parse(userSettingsData);
          if (parsedData.settings) {
            settings = parsedData.settings;
          } else if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
            settings = parsedData;
          }
          
          if (settings) {
            console.log('Loaded user-specific settings from settings key:', settings);
            return settings;
          }
        } catch (parseError) {
          console.error('Error parsing user settings from settings key:', parseError);
        }
      }
      
      // 2. Check the user settings in the auth service storage
      const userSettingsJson = localStorage.getItem(`${USER_SETTINGS_PREFIX}${userId}`);
      if (userSettingsJson) {
        try {
          const userSettings = JSON.parse(userSettingsJson);
          if (userSettings.settings) {
            settings = userSettings.settings;
            console.log('Successfully loaded settings from user auth storage:', settings);
            
            // Sync to other storage locations
            await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
            return settings;
          } else if (typeof userSettings === 'object' && !Array.isArray(userSettings)) {
            // The settings might be stored directly without a settings property
            settings = userSettings;
            console.log('Loaded direct settings object from auth storage:', settings);
            
            // Sync to other storage locations
            await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
            return settings;
          }
        } catch (parseError) {
          console.error('Error parsing user settings from auth storage:', parseError);
        }
      }
      
      // 3. Try backup key
      const backupKey = `wms_user_backup_${userId}`;
      const backupData = localStorage.getItem(backupKey);
      if (backupData) {
        try {
          const backupSettings = JSON.parse(backupData);
          if (backupSettings.settings) {
            settings = backupSettings.settings;
            console.log('Loaded settings from backup storage:', settings);
            
            // Sync to other storage locations
            await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
            return settings;
          }
        } catch (parseError) {
          console.error('Error parsing backup settings data:', parseError);
        }
      }
    }
    
    // 4. If no user-specific settings found or not requested, try global settings
    const globalSettings = localStorage.getItem(SETTINGS_KEY);
    if (globalSettings) {
      try {
        settings = JSON.parse(globalSettings);
        console.log('Loaded global settings:', settings);
        
        // If user is authenticated and we want user-specific settings,
        // also save these global settings to user-specific storage for future use
        if (isUserSpecific && isAuthenticated() && userId !== 'guest') {
          console.log('Saving global settings to user-specific storage for future use');
          await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
        }
        
        return settings;
      } catch (parseError) {
        console.error('Error parsing global settings:', parseError);
      }
    }
    
    // 5. If still no settings found, create default settings
    if (!settings) {
      console.log('No settings found in any storage location, creating defaults');
      settings = {
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        autoSave: true,
        presentationViewMode: 'embed',
        lastVisitedSection: null
      };
      
      // Save default settings to all storage locations
      await saveSettingsToAllStorageLocations(userId, settings, isUserSpecific);
      
      // Also try to save to database if we have a token
      if (token && isUserSpecific && userId !== 'guest') {
        try {
          const response = await fetch(`${config.apiUrl}/save-user-settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              settings,
              userId
            })
          });
          
          if (response.ok) {
            console.log('Successfully saved default settings to database');
          }
        } catch (dbError) {
          console.error('Error saving default settings to database:', dbError);
        }
      }
    }
    
    return settings;
  } catch (error) {
    console.error('Error in loadSettings:', error);
    return null;
  }
};

/**
 * Helper function to save settings to all localStorage locations
 * @param {string} userId - User ID
 * @param {Object} settings - Settings object
 * @param {boolean} isUserSpecific - Whether these are user-specific settings
 * @returns {Promise<boolean>} - Success status
 */
async function saveSettingsToAllStorageLocations(userId, settings, isUserSpecific = true) {
  try {
    // Always save to global settings key for easier access
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // If user-specific, save to user-specific locations
    if (isUserSpecific && userId !== 'guest') {
      // 1. Save to user-specific settings key
      const userSettingsKey = getUserSettingsKey();
      localStorage.setItem(userSettingsKey, JSON.stringify({
        settings,
        lastSaved: new Date().toISOString()
      }));
      
      // 2. Save to auth service storage format
      localStorage.setItem(`${USER_SETTINGS_PREFIX}${userId}`, JSON.stringify({
        settings,
        lastSaved: new Date().toISOString()
      }));
      
      // 3. Create a backup copy
      const backupKey = `wms_user_backup_${userId}`;
      localStorage.setItem(backupKey, JSON.stringify({
        settings,
        lastSaved: new Date().toISOString(),
        source: 'loadSettings'
      }));
    }
    
    console.log('Settings saved to all localStorage locations');
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
}
/**
 * Check if settings exist in localStorage
 * @param {boolean} isUserSpecific - Whether to check for user-specific settings
 * @returns {boolean} - True if settings exist, false otherwise
 */
export const hasStoredSettings = (isUserSpecific = true) => {
  if (isUserSpecific) {
    const userSettingsKey = getUserSettingsKey();
    return localStorage.getItem(userSettingsKey) !== null;
  }
  return localStorage.getItem(SETTINGS_KEY) !== null;
};

/**
 * Clear settings from localStorage
 * @param {boolean} isUserSpecific - Whether to clear user-specific settings
 * @param {boolean} clearGlobal - Whether to also clear global settings
 * @returns {boolean} - True if successful, false otherwise
 */
export const clearSettings = (isUserSpecific = true, clearGlobal = false) => {
  try {
    console.log(`Clearing settings: isUserSpecific=${isUserSpecific}, clearGlobal=${clearGlobal}`);
    
    // Remove global settings if explicitly requested
    if (clearGlobal) {
      localStorage.removeItem(SETTINGS_KEY);
      console.log('Global settings cleared');
    }
    
    // If user-specific and authenticated, remove all user-specific settings
    if (isUserSpecific && isAuthenticated()) {
      const userId = getCurrentUserId();
      if (userId !== 'guest') {
        console.log('Clearing user-specific settings for user ID:', userId);
        
        // Clear from user-specific settings key
        const userSettingsKey = getUserSettingsKey();
        localStorage.removeItem(userSettingsKey);
        console.log('User-specific settings key cleared');
        
        // Clear from auth service storage
        // But first, get the user data to preserve other properties if needed
        let preserveUserData = false;
        if (preserveUserData) {
          const userSettingsJson = localStorage.getItem(`${USER_SETTINGS_PREFIX}${userId}`);
          if (userSettingsJson) {
            try {
              const userData = JSON.parse(userSettingsJson);
              delete userData.settings;
              localStorage.setItem(`${USER_SETTINGS_PREFIX}${userId}`, JSON.stringify(userData));
              console.log('Settings removed from auth service storage while preserving other user data');
            } catch (parseError) {
              console.error('Error parsing user data during settings clear:', parseError);
              localStorage.removeItem(`${USER_SETTINGS_PREFIX}${userId}`);
              console.log('Removed entire user data from auth service storage due to parse error');
            }
          }
        } else {
          // Just remove the settings property from user data
          localStorage.removeItem(`${USER_SETTINGS_PREFIX}${userId}`);
          console.log('Removed user data from auth service storage');
        }
        
        // Clear backup
        const backupKey = `wms_user_backup_${userId}`;
        localStorage.removeItem(backupKey);
        console.log('Backup settings cleared');
      }
    }
    
    console.log('Settings cleared successfully from all requested storage locations');
    return true;
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error);
    return false;
  }
};
