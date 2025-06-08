import { createSlice } from '@reduxjs/toolkit';
import {
  login as loginApi,
  logout as logoutService,
  getCurrentUser,
  getUserFromStorage,
  isAuthenticated,
  checkAndFixAuthState
} from '../../services/authService';

// Selectors will be defined after the slice to avoid circular references

// Check if there's an active session
const checkInitialSession = () => {
  // First check for and fix any inconsistent auth state
  const wasFixed = checkAndFixAuthState();
  if (wasFixed) {
    console.log('Fixed inconsistent authentication state');
  }
  
  if (isAuthenticated()) {
    const user = getUserFromStorage();
    if (user) {
      return {
        isAuthenticated: true,
        user,
        error: null,
        loading: false
      };
    } else {
      // This shouldn't happen if checkAndFixAuthState worked correctly,
      // but just in case, handle it gracefully
      console.error('No user found despite being authenticated');
      return {
        isAuthenticated: false,
        user: null,
        error: null,
        loading: false
      };
    }
  }
  
  return {
    isAuthenticated: false,
    user: null,
    error: null,
    loading: false
  };
};

const initialState = checkInitialSession();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      // Use the logout service to clear token and user data
      logoutService();
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginSuccess, loginFailure, logout, clearError, setLoading } = authSlice.actions;

// Thunk for login
export const login = (username, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    // Call the authentication service
    const authResult = await loginApi(username, password);
    
    // Check if login was successful
    if (authResult.success) {
      // Login successful, dispatch success action with user data
      dispatch(loginSuccess(authResult.user));
      return { success: true, user: authResult.user };
    } else {
      // Login failed, dispatch failure action with error message
      dispatch(loginFailure(authResult.message || 'Login failed'));
      return { success: false, error: authResult.message };
    }
  } catch (error) {
    // Exception occurred, dispatch failure action with error message
    const errorMessage = error.message || 'An unexpected error occurred';
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for checking current user
export const checkAuthState = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Check for and fix any inconsistent auth state
    const wasFixed = checkAndFixAuthState();
    if (wasFixed) {
      console.log('Fixed inconsistent authentication state during checkAuthState');
    }
    
    const user = await getCurrentUser();
    if (user) {
      dispatch(loginSuccess(user));
      
      // Ensure settings are loaded for this user
      // This helps with persistence issues
      const { loadSettings, saveSettings } = require('../../services/storageService');
      const { loadUserSettings, saveUserSettings } = require('../../services/auth/authService');
      
      console.log('Loading settings for authenticated user:', user.id);
      
      // First try to load user-specific settings from auth storage
      const userSettings = loadUserSettings(user.id);
      
      if (userSettings && userSettings.settings) {
        console.log('Found saved settings in auth storage:', userSettings.settings);
        // Save to global settings for consistency
        saveSettings(userSettings.settings, true);
      } else {
        // If no user-specific settings, try loading from global settings
        const settings = loadSettings(true);
        console.log('Loaded settings during auth check:', settings);
        
        if (settings) {
          // Save to user-specific storage for future use
          saveUserSettings(user.id, { settings });
        }
      }
    } else {
      dispatch(logout());
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
  }
};

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectIsLoading = (state) => state.auth.loading;
export const selectIsAdmin = (state) => 
  state.auth.isAuthenticated && state.auth.user?.role === 'admin';
export const selectIsSupervisor = (state) => 
  state.auth.isAuthenticated && 
  (state.auth.user?.role === 'admin' || state.auth.user?.role === 'supervisor');

export default authSlice.reducer;
