/**
 * Admin Utilities
 * 
 * Utility functions for admin-related operations
 */
import config from '../config';

/**
 * Update the current user's role to admin
 * @returns {Promise<Object>} Result of the operation
 */
export const updateCurrentUserToAdmin = async () => {
  try {
    // Get current user from localStorage
    const currentUserData = localStorage.getItem('wms_current_user');
    if (!currentUserData) {
      console.log('Cannot update admin role: No user is currently logged in');
      return { success: false, error: 'No user is currently logged in. Please log in first.' };
    }
    
    const currentUser = JSON.parse(currentUserData);
    
    // Get auth token
    const token = localStorage.getItem('wms_auth_token');
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }
    
    // Call the update-admin-role function
    const response = await fetch(`${config.apiUrl}/update-admin-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: currentUser.username })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to update role' };
    }
    
    const result = await response.json();
    
    // Update the user data in localStorage
    currentUser.role = 'admin';
    localStorage.setItem('wms_current_user', JSON.stringify(currentUser));
    
    // Dispatch an event to notify components that the user data has changed
    window.dispatchEvent(new CustomEvent('user-updated', { detail: currentUser }));
    
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if the current user has admin role and fix if needed
 * @returns {Promise<Object>} Result of the check and fix operation
 */
export const checkAndFixAdminRole = async () => {
  try {
    // Get current user from localStorage
    const currentUserData = localStorage.getItem('wms_current_user');
    if (!currentUserData) {
      // User is not logged in, so this is not an error
      return { success: true, message: 'User not logged in', needsFix: false };
    }
    
    const currentUser = JSON.parse(currentUserData);
    
    // Check if user is already an admin
    if (currentUser.role === 'admin') {
      return { success: true, message: 'User already has admin role', needsFix: false };
    }
    
    // If username is 'admin', update role to admin
    if (currentUser.username === 'admin') {
      const result = await updateCurrentUserToAdmin();
      return { ...result, needsFix: true };
    }
    
    return { success: true, message: 'User is not an admin', needsFix: false };
  } catch (error) {
    console.error('Error checking admin role:', error);
    return { success: false, error: error.message };
  }
};
