import { hashPassword, verifyPassword } from '../../utils/passwordUtils';
import { loadProcesses, loadPresentations } from '../storageService';

// Constants
const STORAGE_KEY = 'wms_users';
const CURRENT_USER_KEY = 'wms_current_user';
const USER_SETTINGS_PREFIX = 'wms_user_settings_';
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  USER: 'user'
};

// Initialize default admin user if no users exist
export const initializeUsers = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const defaultAdmin = {
      id: 1,
      username: 'cb',
      passwordHash: hashPassword('cb'),
      role: ROLES.ADMIN,
      name: 'Admin User'
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: [defaultAdmin]
    }));
  }
};

export const getUsers = () => {
  const userData = localStorage.getItem(STORAGE_KEY);
  return userData ? JSON.parse(userData).users : [];
};

/**
 * Save user-specific settings to localStorage
 * @param {string} userId - The user ID
 * @param {Object} settings - The settings object to save
 */
export const saveUserSettings = (userId, settings) => {
  try {
    const key = `${USER_SETTINGS_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
};

/**
 * Load user-specific settings from localStorage
 * @param {string} userId - The user ID
 * @returns {Object|null} The settings object or null if not found
 */
export const loadUserSettings = (userId) => {
  try {
    const key = `${USER_SETTINGS_PREFIX}${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user settings:', error);
    return null;
  }
};

/**
 * Logout the current user
 * @returns {boolean} Success status
 */
export const logoutUser = () => {
  try {
    // Before logging out, save current application state for the user
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Save current processes and presentations data for this user
      const processes = loadProcesses();
      const presentations = loadPresentations();
      
      if (processes || presentations) {
        saveUserSettings(currentUser.id, {
          processes,
          presentations
        });
      }
    }
    
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

/**
 * Authenticate a user with username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Object} Authentication result
 */
export const authenticateUser = (username, password) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Load user-specific settings if available
    const userSettings = loadUserSettings(user.id);
    if (userSettings) {
      // Restore user's processes and presentations data
      if (userSettings.processes) {
        localStorage.setItem('wms_process_data', JSON.stringify(userSettings.processes));
      }
      if (userSettings.presentations) {
        localStorage.setItem('wms_presentations', JSON.stringify(userSettings.presentations));
      }
    }
    
    // Store current user in localStorage (without password)
    const { passwordHash, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { 
      success: true, 
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { success: false, message: 'Authentication error' };
  }
};

export const addUser = (newUser) => {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }
  
  const userToAdd = {
    id: users.length + 1,
    ...newUser,
    passwordHash: hashPassword(newUser.password)
  };
  
  // Remove plain text password before storing
  delete userToAdd.password;
  
  const updatedUsers = [...users, userToAdd];
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: updatedUsers }));
  
  return { success: true, message: 'User added successfully' };
};

export const updateUser = (username, updates) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Handle password update if provided
  if (updates.password) {
    updates.passwordHash = hashPassword(updates.password);
    delete updates.password;
  }
  
  // Update user
  const updatedUser = { ...users[userIndex], ...updates };
  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: updatedUsers }));
  
  return { success: true, message: 'User updated successfully' };
};

export const deleteUser = (username) => {
  const users = getUsers();
  
  // Prevent deleting the last admin
  const admins = users.filter(u => u.role === ROLES.ADMIN);
  if (admins.length === 1 && admins[0].username.toLowerCase() === username.toLowerCase()) {
    return { success: false, message: 'Cannot delete the last admin user' };
  }
  
  const updatedUsers = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
  
  if (updatedUsers.length === users.length) {
    return { success: false, message: 'User not found' };
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: updatedUsers }));
  
  return { success: true, message: 'User deleted successfully' };
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem(CURRENT_USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const getCurrentSession = () => {
  const sessionData = localStorage.getItem('wms_session');
  return sessionData ? JSON.parse(sessionData) : null;
};

export const createSession = (user) => {
  const session = {
    user,
    timestamp: new Date().getTime(),
    // Session expires in 24 hours
    expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000)
  };
  
  localStorage.setItem('wms_session', JSON.stringify(session));
  return session;
};

export const clearSession = () => {
  localStorage.removeItem('wms_session');
};

export const isSessionValid = () => {
  const session = getCurrentSession();
  if (!session) return false;
  
  return session.expiresAt > new Date().getTime();
};
