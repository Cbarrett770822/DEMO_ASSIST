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
    // Fetch users from database instead of using hardcoded values
    const response = await fetch(`${config.apiUrl}/get-users`);
    
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
    // Always try to fetch fresh data from the database first
    const response = await fetch(`${config.apiUrl}/get-users`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.users) {
        // Update localStorage with the latest data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          users: data.users
        }));
        return data.users;
      }
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
  try {
    // Authenticate with the server
    const response = await fetch(`${config.apiUrl}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }
    
    const authResult = await response.json();
    
    if (!authResult.success) {
      return authResult; // Return error from server
    }
    
    // Store the JWT token
    localStorage.setItem('wms_auth_token', authResult.token);
    
    // Store the user info
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authResult.user));
    
    // Create a new session
    createSession(authResult.user);
    
    // Use unified settings service to handle login
    await unifiedSettingsService.handleUserLogin(authResult.user.id);
    
    // If settings came with the auth response, use them
    if (authResult.settings) {
      console.log('Using settings from authentication response:', authResult.settings);
      await unifiedSettingsService.saveSettings(authResult.settings);
    }
    
    // Dispatch an event to notify the app that settings have been loaded
    window.dispatchEvent(new CustomEvent('settings-loaded', { 
      detail: { userId: authResult.user.id } 
    }));
    
    return authResult;
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
    const response = await fetch(`${config.apiUrl}/update-user`, {
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
      },
      body: JSON.stringify({ username })
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
