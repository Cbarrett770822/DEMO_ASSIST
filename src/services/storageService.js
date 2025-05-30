/**
 * Storage Service
 * 
 * This service provides functions to save and load data to/from localStorage.
 * It's used to persist video assignments, presentations, and settings between app sessions.
 */

// Keys for storing data in localStorage
const PROCESS_DATA_KEY = 'wms_process_data';
const PRESENTATIONS_KEY = 'wms_presentations';
const NOTES_KEY = 'wms_voice_notes';
const SETTINGS_KEY = 'wms_settings';
const USER_SETTINGS_PREFIX = 'wms_user_settings_';

// Get the current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const userJson = localStorage.getItem('wms_auth_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.id || 'guest';
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
  return 'guest';
};

// Get the storage key for the current user's settings
const getUserSettingsKey = () => {
  const userId = getCurrentUserId();
  return `${USER_SETTINGS_PREFIX}${userId}`;
};

/**
 * Save processes data to localStorage
 * @param {Array} processes - Array of process objects
 */
export const saveProcesses = (processes) => {
  try {
    localStorage.setItem(PROCESS_DATA_KEY, JSON.stringify(processes));
    return true;
  } catch (error) {
    console.error('Error saving processes to localStorage:', error);
    return false;
  }
};

/**
 * Load processes data from localStorage
 * @returns {Array|null} - Array of process objects or null if not found
 */
export const loadProcesses = () => {
  try {
    const data = localStorage.getItem(PROCESS_DATA_KEY);
    return data ? JSON.parse(data) : null;
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
 * Save presentations data to localStorage
 * @param {Array} presentations - Array of presentation objects
 */
export const savePresentations = (presentations) => {
  try {
    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(presentations));
    return true;
  } catch (error) {
    console.error('Error saving presentations to localStorage:', error);
    return false;
  }
};

/**
 * Load presentations data from localStorage
 * @returns {Array|null} - Array of presentation objects or null if not found
 */
export const loadPresentations = () => {
  try {
    const data = localStorage.getItem(PRESENTATIONS_KEY);
    return data ? JSON.parse(data) : null;
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
 * Save settings to localStorage
 * @param {Object} settings - Settings object
 * @param {boolean} isUserSpecific - Whether the settings are user-specific
 * @returns {boolean} - True if successful, false otherwise
 */
export const saveSettings = (settings, isUserSpecific = true) => {
  try {
    // Save to global settings
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    // If user-specific, also save to user-specific settings
    if (isUserSpecific) {
      const userSettingsKey = getUserSettingsKey();
      localStorage.setItem(userSettingsKey, JSON.stringify(settings));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
};

/**
 * Load settings from localStorage
 * @param {boolean} isUserSpecific - Whether to load user-specific settings
 * @returns {Object|null} - Settings object or null if not found
 */
export const loadSettings = (isUserSpecific = true) => {
  try {
    // Try to load user-specific settings first if requested
    if (isUserSpecific) {
      const userSettingsKey = getUserSettingsKey();
      const userSettings = localStorage.getItem(userSettingsKey);
      if (userSettings) {
        return JSON.parse(userSettings);
      }
    }
    
    // Fall back to global settings
    const globalSettings = localStorage.getItem(SETTINGS_KEY);
    return globalSettings ? JSON.parse(globalSettings) : null;
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    return null;
  }
};

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
 * @returns {boolean} - True if successful, false otherwise
 */
export const clearSettings = (isUserSpecific = true) => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    
    if (isUserSpecific) {
      const userSettingsKey = getUserSettingsKey();
      localStorage.removeItem(userSettingsKey);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error);
    return false;
  }
};
