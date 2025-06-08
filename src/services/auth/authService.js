/**
 * Authentication Service
 * 
 * This service handles user authentication, session management,
 * and integrates with the unified settings service.
 */

import { hashPassword, verifyPassword } from '../../utils/passwordUtils';
import { loadProcesses, loadPresentations, loadProcessesSync, loadPresentationsSync } from '../storageService';
import * as unifiedSettingsService from '../unifiedSettingsService';
import config from '../../config';
import { shouldUseDevelopmentFallbacks } from '../../utils/environmentUtils';

// Constants
const STORAGE_KEY = 'wms_users';
const CURRENT_USER_KEY = 'wms_current_user';
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  USER: 'user'
};

// Initialize users from database
export const initializeUsers = async () => {
  try {
    // Get the authentication token
    const token = localStorage.getItem('wms_auth_token');
    
    if (!token) {
      console.error('No authentication token available for initializing users');
      return false;
    }
    
    // Fetch users from database instead of using hardcoded values
    const response = await fetch(`${config.apiUrl}/get-users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Only update localStorage if we got valid data from the database
    if (data && data.users && data.users.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        users: data.users
      }));
      console.log('Users loaded from database successfully');
      return true;
    } else {
      console.error('No users found in database');
      return false;
    }
  } catch (error) {
    console.error('Error initializing users from database:', error);
    return false;
  }
};

export const getUsers = async () => {
  try {
    // Get the authentication token
    const token = localStorage.getItem('wms_auth_token');
    
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Authentication required');
    }
    
    // Always try to fetch fresh data from the database first
    const response = await fetch(`${config.apiUrl}/get-users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.users) {
        // Update localStorage with the latest data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          users: data.users
        }));
        return data.users;
      }
    } else {
      console.error('Failed to fetch users:', response.status, response.statusText);
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    // Fall back to localStorage only if database fetch fails
    const userData = localStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData).users : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fall back to localStorage if there's an error
    const userData = localStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData).users : [];
  }
};

// Synchronous version for internal use when we need immediate access
export const getUsersSync = () => {
  const userData = localStorage.getItem(STORAGE_KEY);
  return userData ? JSON.parse(userData).users : [];
};

/**
 * Logout the current user
 * @returns {Promise<boolean>} Success status
 */
export const logoutUser = async () => {
  try {
    // Before logging out, save current application state for the user
    const currentUser = getCurrentUser();
    const token = localStorage.getItem('wms_auth_token');
    
    if (currentUser) {
      console.log('Saving user data before logout for user ID:', currentUser.id);
      
      // Use the unified settings service to handle logout
      try {
        await unifiedSettingsService.handleUserLogout();
        console.log('Settings saved before logout');
      } catch (settingsError) {
        console.error('Error handling settings during logout:', settingsError);
        // Continue with logout even if settings saving fails
      }
    }
    
    // Revoke token on server if available
    if (token) {
      try {
        const response = await fetch(`${config.apiUrl}/revoke-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log('Token revoked on server successfully');
        } else {
          console.warn('Failed to revoke token on server:', await response.text());
        }
      } catch (revokeError) {
        console.warn('Error revoking token on server:', revokeError);
        // Continue with logout even if token revocation fails
      }
    }
    
    // Clear auth token and user data
    localStorage.removeItem('wms_auth_token');
    localStorage.removeItem(CURRENT_USER_KEY);
    
    // Clear session
    clearSession();
    
    console.log('User logged out successfully');
    
    // Dispatch an event to notify the app that the user has logged out
    window.dispatchEvent(new CustomEvent('user-logout'));
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Try to clean up anyway
    try {
      localStorage.removeItem('wms_auth_token');
      localStorage.removeItem(CURRENT_USER_KEY);
      clearSession();
    } catch (cleanupError) {
      console.error('Error during logout cleanup:', cleanupError);
    }
    
    return false;
  }
};

/**
 * Authenticate a user with username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} Authentication result
 */
export const authenticateUser = async (username, password) => {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const disableFallback = config?.development?.disableFallback === true || process.env.DISABLE_DEV_FALLBACK === 'true';
  
  console.log('Authenticating user:', username, 'in environment:', isDevelopment ? 'development' : 'production');
  console.log('Development fallback disabled:', disableFallback ? 'yes' : 'no');
  console.log('Should use development fallbacks:', shouldUseDevelopmentFallbacks() ? 'yes' : 'no');
  
  // Default users for development fallback
  const defaultUsers = ['admin', 'user', 'supervisor'];
  const defaultRoles = {'admin': 'admin', 'user': 'user', 'supervisor': 'supervisor'};
  
  // Check for development fallback first to avoid unnecessary network requests
  // Only use fallback if it's not disabled
  if (isDevelopment && !disableFallback && defaultUsers.includes(username) && password === 'password') {
    console.log(`Using development fallback for ${username} authentication (fast path)`);
    const userId = `${username}-dev-id`;
    return {
      success: true,
      message: `Login successful for ${username} (DEV FALLBACK)`,
      token: `${userId}:${username}:${defaultRoles[username] || 'user'}`,
      user: {
        id: userId,
        username: username,
        role: defaultRoles[username] || 'user'
      }
    };
  }
  
  try {
    // Validate inputs
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required'
      };
    }
    
    let response;
    let authResult;
    let useDevFallback = false;
    
    try {
      // Make the API call to authenticate the user
      console.log('Attempting to authenticate with server...');
      response = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      // Try to parse the response
      const responseText = await response.text();
      console.log('Authentication response received:', responseText.substring(0, 100));
      
      try {
        authResult = JSON.parse(responseText);
        console.log('Authentication result parsed successfully:', authResult.success);
      } catch (jsonError) {
        console.error('Error parsing authentication response:', jsonError);
        console.log('Raw response:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    } catch (fetchError) {
      console.error('Fetch error during authentication:', fetchError);
      
      // Development fallback for default users
      const defaultUsers = ['admin', 'user', 'supervisor'];
      const defaultRoles = {'admin': 'admin', 'user': 'user', 'supervisor': 'supervisor'};
      
      // Only use fallback if it's not disabled
      if (isDevelopment && !disableFallback && defaultUsers.includes(username) && password === 'password') {
        console.log(`Using development fallback for ${username} authentication`);
        useDevFallback = true;
        const userId = `${username}-dev-id`;
        authResult = {
          success: true,
          message: `Login successful for ${username} (DEV FALLBACK)`,
          token: `${userId}:${username}:${defaultRoles[username] || 'user'}`,
          user: {
            id: userId,
            username: username,
            role: defaultRoles[username] || 'user'
          }
        };
      } else {
        throw fetchError; // Re-throw for production or non-default users
      }
    }
    
    // If not using fallback, check if the response is OK
    if (!useDevFallback && !response.ok) {
      console.error('Authentication failed with status:', response.status);
      return { 
        success: false, 
        message: authResult?.message || `Authentication failed with status ${response.status}`
      };
    }
    
    // Check if the authentication was successful
    if (!useDevFallback && !authResult.success) {
      console.error('Authentication failed:', authResult.message);
      return { 
        success: false, 
        message: authResult.message || 'Authentication failed'
      };
    }
    
    // Convert login response to the expected format
    const authResultFinal = {
      success: true,
      authenticated: true,
      message: authResult.message || 'Login successful',
      user: authResult.user,
      token: authResult.token
    };
    
    // Log the authentication result for debugging
    console.log('Authentication result:', authResultFinal);
    
    // Store the JWT token
    localStorage.setItem('wms_auth_token', authResult.token);
    
    // Ensure the user object has the correct role
    if (authResult.user) {
      // Log the user object to help with debugging
      console.log('Authenticated user:', authResult.user);
      console.log('User role:', authResult.user.role);
      
      // Make sure the role is properly set
      if (authResult.user.username === 'admin' && (!authResult.user.role || authResult.user.role !== 'admin')) {
        console.log('Fixing admin role for admin user');
        authResult.user.role = 'admin';
        authResultFinal.user.role = 'admin';
      }
      
      // Ensure the user has an ID
      if (!authResult.user.id && authResult.user._id) {
        console.log('Converting _id to id for consistency');
        authResult.user.id = authResult.user._id;
        authResultFinal.user.id = authResult.user._id;
      }
    }
    
    // Store the user info with consistent structure
    localStorage.setItem('wms_current_user', JSON.stringify(authResultFinal.user));
    
    // Set the authentication status
    let isAuthenticatedStatus = true;
    let currentUser = authResultFinal.user;
    
    // Load user settings
    try {
      const { handleUserLogin } = await import('../unifiedSettingsService');
      
      // Ensure we have a valid user ID for settings
      const userId = authResultFinal.user?.id || authResult.user?.id || authResult.user?._id;
      
      if (userId) {
        console.log('Loading settings for user:', userId);
        await handleUserLogin(userId);
      } else {
        console.warn('User object missing id, cannot load user-specific settings');
        // Create a fallback user ID for development mode
        if (authResult.user?.username === 'admin') {
          console.log('Using fallback ID for admin user settings');
          await handleUserLogin('admin-user-id');
        }
      }
    } catch (settingsError) {
      console.error('Error loading user settings during login:', settingsError);
      // Continue with login even if settings loading fails
      // Attempt to load global settings as fallback
      try {
        const { loadGlobalSettings } = await import('../unifiedSettingsService');
        await loadGlobalSettings();
        console.log('Loaded global settings as fallback after user settings error');
      } catch (globalSettingsError) {
        console.error('Failed to load global settings as fallback:', globalSettingsError);
      }
    }
    
    // Return the authentication result with consistent data
    return {
      success: true,
      user: authResultFinal.user,
      token: authResultFinal.token,
      message: authResultFinal.message || 'Authentication successful'
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { 
      success: false, 
      message: 'Authentication failed. The server may be unavailable. Please try again later.'
    };
  }
};

export const addUser = async (newUser) => {
  try {
    // Add user to the database
    const response = await fetch(`${config.apiUrl}/add-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
      },
      body: JSON.stringify(newUser)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add user: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      return result; // Return error from server
    }
    
    // Update local cache
    const users = await getUsers();
    users.push(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users }));
    
    return result;
  } catch (error) {
    console.error('Error adding user:', error);
    return { 
      success: false, 
      message: 'Failed to add user. The server may be unavailable.'
    };
  }
};

export const updateUser = async (username, updates) => {
  try {
    // Update user in the database
    const response = await fetch(`${config.apiUrl}/users/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
      },
      body: JSON.stringify({ username, updates })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      return result; // Return error from server
    }
    
    // Update local cache
    const users = await getUsers();
    const index = users.findIndex(user => user.username === username);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users }));
    }
    
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      message: 'Failed to update user. The server may be unavailable.'
    };
  }
};

export const deleteUser = async (username) => {
  try {
    // Delete user from the database
    const response = await fetch(`${config.apiUrl}/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      return result; // Return error from server
    }
    
    // Update local cache
    const users = await getUsers();
    const filteredUsers = users.filter(user => user.username !== username);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: filteredUsers }));
    
    return result;
  } catch (error) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      message: 'Failed to delete user. The server may be unavailable.'
    };
  }
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const getCurrentSession = () => {
  const sessionJson = localStorage.getItem('wms_session');
  return sessionJson ? JSON.parse(sessionJson) : null;
};

export const createSession = (user) => {
  const now = new Date();
  const expiresAt = now.getTime() + (24 * 60 * 60 * 1000); // 24 hours
  
  localStorage.setItem('wms_session', JSON.stringify({
    userId: user.id,
    username: user.username,
    createdAt: now.getTime(),
    expiresAt
  }));
};

export const clearSession = () => {
  localStorage.removeItem('wms_session');
};

export const isSessionValid = () => {
  const session = getCurrentSession();
  if (!session) return false;
  
  return session.expiresAt > new Date().getTime();
};

/**
 * Check if a user is currently authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('wms_auth_token');
  const currentUser = getCurrentUser();
  const session = getCurrentSession();
  
  // User is authenticated if all three conditions are met:
  // 1. Has a valid token
  // 2. Has current user data
  // 3. Has a valid session
  return !!token && !!currentUser && isSessionValid();
};

/**
 * Check for and fix inconsistent authentication state
 * This can happen if the token exists but user data is missing
 * @returns {boolean} - True if fixed, false if no issues found
 */
export const checkAndFixAuthState = async () => {
  const token = localStorage.getItem('wms_auth_token');
  const currentUser = getCurrentUser();
  const session = getCurrentSession();
  
  console.log('Checking auth state consistency...');
  
  // Case 1: If we have a token but no user data, we're in an inconsistent state
  if (token && !currentUser) {
    console.warn('Inconsistent auth state detected: Token exists but no user data');
    // Clear the token since we can't determine the user
    localStorage.removeItem('wms_auth_token');
    // Also clear session if it exists
    if (session) clearSession();
    return true;
  }
  
  // Case 2: If we have user data but no token, also inconsistent
  if (!token && currentUser) {
    console.warn('Inconsistent auth state detected: User data exists but no token');
    
    // Before clearing user data, ensure settings are preserved using the unified service
    try {
      // The unified settings service will handle preserving settings
      // during authentication state changes
      await unifiedSettingsService.saveSettings(unifiedSettingsService.loadSettings());
    } catch (error) {
      console.error('Error saving settings during auth state fix:', error);
    }
    
    // Clear the user data
    localStorage.removeItem(CURRENT_USER_KEY);
    // Also clear session if it exists
    if (session) clearSession();
    return true;
  }
  
  // Case 3: If we have a token and user data but session is invalid or missing
  if (token && currentUser && (!session || !isSessionValid())) {
    console.warn('Inconsistent auth state detected: Valid token and user data but invalid session');
    
    // Create a new session to fix the issue
    createSession(currentUser);
    console.log('Created new session to fix auth state inconsistency');
    return true;
  }
  
  // Case 4: Initialize settings if needed
  if (token && currentUser && session) {
    try {
      // Use the unified settings service to ensure settings are properly loaded
      await unifiedSettingsService.initSettings();
    } catch (error) {
      console.error('Error checking settings consistency:', error);
    }
  }
  
  console.log('Auth state is consistent');
  return false; // No issues found
};

/**
 * Load user-specific settings from localStorage
 * @param {string} userId - User ID to load settings for
 * @returns {Object|null} - User settings object or null if not found
 */
export const loadUserSettings = (userId) => {
  try {
    if (!userId) {
      console.error('Cannot load user settings: No user ID provided');
      return null;
    }
    
    const userSettingsKey = `wms_user_settings_${userId}`;
    const userSettingsJson = localStorage.getItem(userSettingsKey);
    
    if (!userSettingsJson) {
      console.log(`No settings found for user ID: ${userId}`);
      return null;
    }
    
    const userSettings = JSON.parse(userSettingsJson);
    console.log(`Loaded settings for user ID: ${userId}`, userSettings);
    return userSettings;
  } catch (error) {
    console.error(`Error loading settings for user ID: ${userId}`, error);
    return null;
  }
};

/**
 * Save user-specific settings to localStorage
 * @param {string} userId - User ID to save settings for
 * @param {Object} data - Settings data to save
 * @returns {boolean} - True if successful, false otherwise
 */
export const saveUserSettings = (userId, data) => {
  try {
    if (!userId) {
      console.error('Cannot save user settings: No user ID provided');
      return false;
    }
    
    if (!data) {
      console.error('Cannot save user settings: No data provided');
      return false;
    }
    
    const userSettingsKey = `wms_user_settings_${userId}`;
    localStorage.setItem(userSettingsKey, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    }));
    
    console.log(`Saved settings for user ID: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error saving settings for user ID: ${userId}`, error);
    return false;
  }
};

/**
 * Get user from localStorage by token
 * @returns {Object|null} - User object or null if not found
 */
export const getUserFromStorage = () => {
  return getCurrentUser();
};
