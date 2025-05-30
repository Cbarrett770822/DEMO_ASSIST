// Authentication service for interacting with the user authentication API
import { createSlice } from '@reduxjs/toolkit';

// API endpoints
const API_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  GET_USER: '/api/getUser',
  GET_USERS: '/api/getUsers'
};

// Local storage keys
const TOKEN_KEY = 'wms_auth_token';
const USER_KEY = 'wms_auth_user';

// Development mode - set to true to use mock data instead of API calls
const DEV_MODE = true;

// Mock users for development mode
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

// Mock token generator
const generateMockToken = (user) => {
  return btoa(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 3600000 // 1 hour expiration
  }));
};

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object>} Promise that resolves to the user object
 */
export const login = async (username, password) => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check credentials against mock users
        if (username === 'admin' && password === 'admin123') {
          const user = MOCK_USERS[0];
          const token = generateMockToken(user);
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          resolve(user);
        } else if (username === 'user' && password === 'user123') {
          const user = MOCK_USERS[1];
          const token = generateMockToken(user);
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Save token and user to localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register user
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} role - User role (admin or user)
 * @returns {Promise<Object>} Promise that resolves to the user object
 */
export const register = async (username, password, role = 'user') => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if username already exists
        const existingUser = MOCK_USERS.find(u => u.username === username);
        if (existingUser) {
          reject(new Error('Username already exists'));
          return;
        }
        
        // Create new user
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          username,
          role,
          createdAt: new Date().toISOString()
        };
        
        // Add to mock users
        MOCK_USERS.push(newUser);
        
        // Generate token
        const token = generateMockToken(newUser);
        
        // Save to localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        
        resolve(newUser);
      }, 500); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, role })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Save token and user to localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  // Remove token and user from localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get current user
 * @returns {Promise<Object|null>} Promise that resolves to the user object or null if not authenticated
 */
export const getCurrentUser = async () => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          resolve(null);
          return;
        }
        
        try {
          // Parse token
          const tokenData = JSON.parse(atob(token));
          
          // Check if token is expired
          if (tokenData.exp < Date.now()) {
            logout();
            resolve(null);
            return;
          }
          
          // Get user from localStorage
          const user = getUserFromStorage();
          if (!user) {
            logout();
            resolve(null);
            return;
          }
          
          resolve(user);
        } catch (error) {
          console.error('Invalid token format:', error);
          logout();
          resolve(null);
        }
      }, 300); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    
    const response = await fetch(API_ENDPOINTS.GET_USER, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // If token is invalid or expired, logout
      if (response.status === 401) {
        logout();
        return null;
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user');
    }

    const data = await response.json();
    
    // Update user in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Promise that resolves to an array of user objects
 */
export const getAllUsers = async () => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          reject(new Error('Authentication required'));
          return;
        }
        
        try {
          // Parse token
          const tokenData = JSON.parse(atob(token));
          
          // Check if token is expired
          if (tokenData.exp < Date.now()) {
            logout();
            reject(new Error('Token expired'));
            return;
          }
          
          // Check if user is admin
          if (tokenData.role !== 'admin') {
            reject(new Error('Admin access required'));
            return;
          }
          
          // Return mock users
          resolve(MOCK_USERS);
        } catch (error) {
          console.error('Invalid token format:', error);
          reject(new Error('Invalid token'));
        }
      }, 500); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.GET_USERS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get users');
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Get user from localStorage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getUserFromStorage = () => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  const user = getUserFromStorage();
  return user && user.role === 'admin';
};
