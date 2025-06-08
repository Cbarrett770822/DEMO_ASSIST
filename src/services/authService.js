/**
 * Authentication Service - Redirecting to new location
 * 
 * This file is kept for backward compatibility.
 * All authentication functionality has been moved to ./auth/authService.js
 */

// Import all exports from the new location
import * as authService from './auth/authService';

// Re-export functions that actually exist in the implementation
export const {
  authenticateUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  saveUserSettings,
  loadUserSettings,
  addUser,
  updateUser,
  deleteUser,
  createSession,
  clearSession,
  checkAndFixAuthState,
  ROLES
} = authService;

// For backward compatibility, provide login as an alias for authenticateUser
export const login = authService.authenticateUser;

// For backward compatibility, provide register as an alias for addUser
export const register = authService.addUser;

/**
 * Logout user
 */
export const logout = authService.logoutUser;

// For backward compatibility
export const getUserFromStorage = authService.getCurrentUser;

// Admin check function
export const isAdmin = (user) => {
  return user && user.role === ROLES.ADMIN;
};

// Get all users function
export const getAllUsers = async () => {
  return await authService.getUsers();
};

// Get user by ID function
export const getUserById = async (userId) => {
  const users = await authService.getUsers();
  return users.find(user => user.id === userId) || null;
};

// End session alias for clearSession
export const endSession = authService.clearSession;
