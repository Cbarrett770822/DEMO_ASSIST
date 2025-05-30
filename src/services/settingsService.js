/**
 * Settings Service
 * 
 * This service provides functions to manage application settings,
 * including user-specific settings that persist across sessions.
 */

import { saveSettings, loadSettings, hasStoredSettings, clearSettings } from './storageService';
import { getUserFromStorage } from './authService';

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
 * @returns {Object} - Settings object
 */
export const initSettings = () => {
  // Try to load user-specific settings first
  const settings = loadSettings(true);
  
  // If no settings found, use defaults
  if (!settings) {
    // Save default settings
    saveSettings(DEFAULT_SETTINGS, true);
    return DEFAULT_SETTINGS;
  }
  
  return settings;
};

/**
 * Get all settings
 * @returns {Object} - Settings object
 */
export const getSettings = () => {
  return loadSettings(true) || DEFAULT_SETTINGS;
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
 * @returns {Object} - Updated settings object
 */
export const updateSettings = (newSettings) => {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  // Save updated settings
  saveSettings(updatedSettings, true);
  
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
 * @returns {Object} - User settings
 */
export const getCurrentUserSettings = () => {
  // Force reload of settings based on current user
  return loadSettings(true) || DEFAULT_SETTINGS;
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
