import { createSlice } from '@reduxjs/toolkit';
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
  getUserFromStorage,
  isAuthenticated
} from '../../services/authService';

// Check if there's an active session
const checkInitialSession = () => {
  if (isAuthenticated()) {
    const user = getUserFromStorage();
    return {
      isAuthenticated: true,
      user,
      error: null,
      loading: false
    };
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
      logoutApi();
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
    
    const user = await loginApi(username, password);
    dispatch(loginSuccess(user));
    return true;
  } catch (error) {
    dispatch(loginFailure(error.message));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for checking current user
export const checkAuthState = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const user = await getCurrentUser();
    if (user) {
      dispatch(loginSuccess(user));
    } else {
      dispatch(logout());
    }
  } catch (error) {
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
