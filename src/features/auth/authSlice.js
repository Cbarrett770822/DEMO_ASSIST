import { createSlice } from '@reduxjs/toolkit';
import { 
  authenticateUser, 
  logoutUser, 
  getCurrentUser, 
  createSession, 
  clearSession, 
  getCurrentSession, 
  isSessionValid,
  initializeUsers
} from '../../services/auth/authService';

// Initialize users with default admin if needed
initializeUsers();

// Check if there's an active session
const checkInitialSession = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    return {
      isAuthenticated: true,
      user: currentUser,
      error: null
    };
  }
  
  return {
    isAuthenticated: false,
    user: null,
    error: null
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
      // Use the logoutUser service which saves user settings before logging out
      logoutUser();
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Thunk for login
export const login = (username, password) => (dispatch) => {
  const result = authenticateUser(username, password);
  
  if (result.success) {
    createSession(result.user);
    dispatch(loginSuccess(result.user));
    return true;
  } else {
    dispatch(loginFailure(result.message));
    return false;
  }
};

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => 
  state.auth.isAuthenticated && state.auth.user?.role === 'admin';
export const selectIsSupervisor = (state) => 
  state.auth.isAuthenticated && 
  (state.auth.user?.role === 'admin' || state.auth.user?.role === 'supervisor');

export default authSlice.reducer;
