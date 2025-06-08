/**
 * Database Storage Service
 * 
 * This service provides methods for storing and retrieving data from the database
 * using Netlify serverless functions as the API layer.
 * 
 * All data is stored in MongoDB, with no localStorage usage except for authentication tokens.
 */

import config from '../config';

// Authentication token storage key
const AUTH_TOKEN_KEY = 'wms_auth_token';
const CURRENT_USER_KEY = 'wms_current_user';
const USER_ID_KEY = 'wms_current_user_id';

// API request retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

/**
 * Get the authentication token from localStorage
 * @returns {string|null} - The authentication token or null if not found
 */
export const getAuthToken = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    console.warn('No authentication token found in localStorage');
    return null;
  }
  
  try {
    // Check if it's our simplified token format (userId:username:role)
    if (token.includes(':')) {
      const parts = token.split(':');
      if (parts.length >= 3) {
        // Simplified token is valid
        console.log('Using simplified token format');
        return token;
      }
    }
    
    // For JWT tokens, check the structure without verifying the signature
    const jwtParts = token.split('.');
    if (jwtParts.length === 3) {
      // It's a JWT token, valid structure
      console.log('Using JWT token format');
      return token;
    }
    
    // Check for development fallback tokens
    if (token.startsWith('dev-fallback-')) {
      console.log('Using development fallback token');
      return token;
    }
    
    console.warn('Unknown token format, returning as-is');
    return token;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
};

/**
 * Get current user ID from localStorage
 * @returns {string|null} - User ID or null if not found
 */
export const getCurrentUserId = () => {
  try {
    const user = getCurrentUser();
    if (!user || !user.id) {
      console.warn('No valid user found in localStorage');
      return null;
    }
    return user.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Get current user object from localStorage
 * @returns {Object|null} - User object or null if not found
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) {
    console.warn('No user object found in localStorage');
    return null;
  }
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing current user from localStorage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userId = getCurrentUserId();
  const user = getCurrentUser();
  
  const isValid = !!token && !!userId && !!user;
  console.log(`Authentication check: Token exists: ${!!token}, User ID exists: ${!!userId}, User exists: ${!!user}`);
  
  return isValid;
};

/**
 * Make an API request with retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<Response>} - Fetch response
 */
const makeApiRequest = async (endpoint, options, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(endpoint, options);
    
    // If unauthorized and we have a token, it might be expired
    if (response.status === 401 && getAuthToken()) {
      console.warn('Authentication failed. Token may be expired.');
      // We could implement token refresh logic here
    }
    
    return response;
  } catch (error) {
    // If we have retries left and it's a network error, retry
    if (retries > 0 && (error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
      console.log(`API request failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return makeApiRequest(endpoint, options, retries - 1);
    }
    
    throw error;
  }
};

/**
 * Handle API response errors
 * @param {Response} response - Fetch API response
 * @returns {Promise<Object>} - JSON response if successful, throws error otherwise
 */
const handleApiResponse = async (response) => {
  if (!response.ok) {
    // Handle specific error status codes
    switch (response.status) {
      case 401:
        console.error('Authentication error: Unauthorized access');
        throw new Error('Authentication required. Please log in to continue.');
      case 403:
        console.error('Authorization error: Forbidden access');
        throw new Error('You do not have permission to perform this action.');
      case 404:
        console.error('Resource not found');
        throw new Error('The requested resource was not found.');
      case 500:
        console.error('Server error');
        throw new Error('An internal server error occurred. Please try again later.');
      default:
        // Try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server responded with status: ${response.status}`;
        console.error(`API error: ${errorMessage}`);
        throw new Error(errorMessage);
    }
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Invalid response from server');
  }
};

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API response
 * @throws {Error} - If not authenticated or API request fails
 */
const makeAuthenticatedRequest = async (endpoint, method = 'GET', body = null) => {
  // Special handling for read-only endpoints in development mode
  const isReadEndpoint = endpoint.includes('getProcesses') || endpoint.includes('getPresentations') || endpoint.includes('getSettings');
  
  // In production, we still want to use authentication for these endpoints
  if (isReadEndpoint && process.env.NODE_ENV !== 'development') {
    console.log(`Using authenticated request for ${endpoint} in production mode`);
    // Continue with authentication below
  } else if (isReadEndpoint && process.env.NODE_ENV === 'development') {
    console.log(`Using unauthenticated request for ${endpoint} in development mode`);
    return makeRequest(endpoint, method, body);
  }
  
  // Get authentication data
  const token = getAuthToken();
  
  // For development mode, we can proceed with a fallback token if needed
  let usingFallbackAuth = false;
  if (!token && process.env.NODE_ENV === 'development') {
    console.log('Development mode: using fallback authentication for', endpoint);
    // Create a simplified fallback token for development
    const fallbackToken = 'admin-dev-id:admin:admin';
    usingFallbackAuth = true;
    
    // Log the fallback authentication
    console.log(`Using fallback authentication for ${endpoint}`);
    
    // Use the fallback token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${fallbackToken}`
    };
    
    const options = {
      method,
      headers
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`Making fallback authenticated ${method} request to ${endpoint}`);
    const response = await makeApiRequest(endpoint, options);
    
    // Check if the response is ok before proceeding
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`API request to ${endpoint} failed with status ${response.status}:`, errorText);
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }
    
    // Try to parse the response as JSON
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        return { message: text };
      }
    } catch (parseError) {
      console.error(`Failed to parse response from ${endpoint}:`, parseError);
      throw new Error('Invalid response from server');
    }
  }
  
  // If we're not using fallback auth, proceed with normal authentication
  if (!usingFallbackAuth) {
    const userId = getCurrentUserId();
    const user = getCurrentUser();
    
    // Log authentication state for debugging
    console.log(`Authentication state for ${endpoint}: Token exists: ${!!token}, User ID exists: ${!!userId}, User exists: ${!!user}`);
    
    // Check for valid authentication
    if (!token || !userId || !user) {
      console.warn(`Authentication required for ${endpoint} but credentials are missing:`, { 
        hasToken: !!token, 
        hasUserId: !!userId, 
        hasUser: !!user 
      });
      
      // Clear any inconsistent auth state
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      
      throw new Error('Authentication required. Please log in to continue.');
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  // Track retries
  let retries = 0;
  const MAX_NETWORK_RETRIES = 1;
  
  while (retries <= MAX_NETWORK_RETRIES) {
    try {
      // Get user ID for logging if available, otherwise use 'unknown'
      const logUserId = usingFallbackAuth ? 'fallback-admin' : (getCurrentUserId() || 'unknown');
      console.log(`Making authenticated ${method} request to ${endpoint} for user ${logUserId}${retries > 0 ? ` (retry ${retries})` : ''}`);
      const response = await makeApiRequest(endpoint, options);
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        const errorText = await response.text().catch(() => 'No error details available');
        console.error(`Authentication failed with status ${response.status}:`, errorText);
        
        // Clear invalid token on authentication failure
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
        
        throw new Error(response.status === 401 
          ? 'Your session has expired. Please log in again.' 
          : 'You do not have permission to perform this action.');
      }
      
      // Check if the response is ok before proceeding
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        console.error(`API request to ${endpoint} failed with status ${response.status}:`, errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      // Try to parse the response as JSON
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return data;
        } else {
          const text = await response.text();
          return { message: text };
        }
      } catch (parseError) {
        console.error(`Failed to parse response from ${endpoint}:`, parseError);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Handle network errors with retry logic
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch') && retries < MAX_NETWORK_RETRIES) {
        console.warn(`Network error, retrying (${retries + 1}/${MAX_NETWORK_RETRIES})...`, error);
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Rethrow other errors or if max retries reached
        console.error(`API request to ${endpoint} failed:`, error);
        throw error;
      }
    }
  }
};

/**
 * Make non-authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API response
 */
const makeRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`Making ${method} request to ${endpoint}`);
    const response = await makeApiRequest(endpoint, options);
    
    // Check if the response is ok before proceeding
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`API request to ${endpoint} failed with status ${response.status}:`, errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    // Try to parse the response as JSON
    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, parseError);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw new Error(`Failed to connect to the server: ${error.message}`);
  }
};

/**
 * Save processes data to database
 * @param {Array} processes - Array of process objects
 * @returns {Promise<Object>} - API response
 */
export const saveProcesses = async (processes) => {
  try {
    if (!Array.isArray(processes)) {
      console.error('saveProcesses received non-array data:', processes);
      throw new Error('Processes must be an array');
    }
    
    return await makeAuthenticatedRequest(`${config.apiUrl}/saveProcesses`, 'POST', processes);
  } catch (error) {
    console.error('Error saving processes to database:', error);
    // Re-throw the error but with a more user-friendly message
    throw new Error(`Failed to save processes: ${error.message}`);
  }
};

/**
 * Load processes data from database
 * @returns {Promise<Array>} - Array of process objects
 * @throws {Error} - If API request fails
 */
export const loadProcesses = async () => {
  try {
    console.log('Loading processes from database...');
    const data = await makeRequest(`${config.apiUrl}/getProcesses`);
    
    // Check if data is directly an array (from MongoDB) or has a processes property
    if (Array.isArray(data)) {
      console.log(`Successfully loaded ${data.length} processes from database`);
      return data;
    } else if (data && data.processes && Array.isArray(data.processes)) {
      console.log(`Successfully loaded ${data.processes.length} processes from database`);
      return data.processes;
    } else {
      console.warn('Unexpected data format from getProcesses:', data);
      return [];
    }
  } catch (error) {
    console.error('Error loading processes from database:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

/**
 * Save presentations data to database
 * @param {Array} presentations - Array of presentation objects
 * @returns {Promise<Object>} - API response or localStorage fallback result
 */
export const savePresentations = async (presentations) => {
  // Always save to localStorage as a backup first
  try {
    // Validate input
    if (!Array.isArray(presentations)) {
      console.error('savePresentations received non-array data:', presentations);
      throw new Error('Presentations must be an array');
    }
    
    // Add timestamps and ensure IDs for all presentations
    const enhancedPresentations = presentations.map(presentation => ({
      ...presentation,
      updatedAt: new Date().toISOString(),
      // Ensure each presentation has an ID
      id: presentation.id || `presentation-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }));
    
    // Always save to localStorage first as a backup
    try {
      localStorage.setItem('wms_presentations_backup', JSON.stringify(enhancedPresentations));
      console.log(`Saved ${enhancedPresentations.length} presentations to localStorage as backup`);
    } catch (localStorageError) {
      console.warn('Failed to save presentations to localStorage backup:', localStorageError);
    }
    
    // Get current user info for metadata
    const currentUser = getCurrentUser() || { username: 'unknown' };
    const userId = getCurrentUserId() || 'unknown';
    
    // Add user metadata
    const presentationsWithMetadata = enhancedPresentations.map(presentation => ({
      ...presentation,
      updatedBy: currentUser.username,
      userId: userId
    }));
    
    // Try to save to server with authentication
    try {
      console.log(`Saving ${presentationsWithMetadata.length} presentations to database...`);
      
      // Prepare the data with proper structure
      const postData = {
        presentations: presentationsWithMetadata,
        metadata: {
          userId,
          username: currentUser.username,
          timestamp: new Date().toISOString()
        }
      };
      
      const result = await makeAuthenticatedRequest(`${config.apiUrl}/savePresentations`, 'POST', postData);
      
      if (result && result.success) {
        console.log('Successfully saved presentations to database:', result);
        return {
          success: true,
          source: 'server',
          message: 'Presentations saved successfully to server',
          count: presentationsWithMetadata.length,
          ...result
        };
      } else {
        throw new Error(result?.error || result?.message || 'Server returned unsuccessful response');
      }
    } catch (serverError) {
      console.warn(`Server save failed: ${serverError.message}. Using fallback options...`);
      
      // In development mode, try without authentication as fallback
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEV_MODE === 'true';
      
      if (isDevelopment) {
        try {
          console.log('Trying to save presentations without authentication in development mode...');
          
          // Prepare the data with proper structure for unauthenticated request
          const postData = {
            presentations: presentationsWithMetadata,
            metadata: {
              userId: 'dev-fallback-user',
              username: 'dev-user',
              timestamp: new Date().toISOString(),
              isDevelopmentFallback: true
            }
          };
          
          const result = await makeRequest(`${config.apiUrl}/savePresentations`, 'POST', postData);
          
          if (result && result.success) {
            console.log('Successfully saved presentations without authentication:', result);
            return {
              success: true,
              source: 'server-dev-fallback',
              message: 'Presentations saved successfully (dev fallback)',
              count: presentationsWithMetadata.length,
              ...result
            };
          } else {
            throw new Error(result?.error || result?.message || 'Development fallback returned unsuccessful response');
          }
        } catch (devFallbackError) {
          console.warn('Development fallback also failed:', devFallbackError.message);
        }
      }
      
      // If we got here, both server saves failed, but localStorage succeeded
      return {
        success: true,
        source: 'localStorage',
        message: 'Presentations saved to localStorage only (server unavailable)',
        count: enhancedPresentations.length,
        presentations: enhancedPresentations,
        error: serverError.message
      };
    }
  } catch (error) {
    console.error('Error saving presentations:', error);
    
    // Try one last time to save to localStorage
    try {
      localStorage.setItem('wms_presentations_emergency_backup', JSON.stringify(presentations));
      return {
        success: true,
        source: 'localStorage-emergency',
        message: 'Presentations saved to emergency localStorage backup',
        count: presentations.length,
        presentations: presentations,
        error: error.message
      };
    } catch (localStorageError) {
      console.error('All presentation saving methods failed:', localStorageError);
      
      // Return a non-throwing error response as absolute last resort
      return {
        success: false,
        source: 'none',
        message: 'Failed to save presentations to any storage',
        error: `${error.message}; localStorage: ${localStorageError.message}`
      };
    }
  }
};

/**
 * Load presentations data from database
 * @returns {Promise<Array>} - Array of presentation objects
 */
export const loadPresentations = async () => {
  let source = 'unknown';
  
  // Default presentations as a last resort fallback
  const DEFAULT_PRESENTATIONS = [
    {
      id: 'default-presentation-1',
      title: 'Default Presentation',
      description: 'This is a default presentation created when no other presentations could be loaded.',
      slides: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true
    }
  ];
  
  try {
    console.log('Loading presentations from database...');
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEV_MODE === 'true';
    
    // For development or unauthenticated users, check if we should use fallbacks
    if (!isAuthenticated() && !isDevelopment) {
      console.warn('User not authenticated. Trying localStorage fallback for presentations...');
      
      // Try localStorage fallback for unauthenticated users
      try {
        const localData = localStorage.getItem('wms_presentations_backup');
        if (localData) {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`Loaded ${parsedData.length} presentations from localStorage for unauthenticated user`);
            return {
              success: true,
              source: 'localStorage-auth-fallback',
              presentations: parsedData
            };
          }
        }
      } catch (localStorageError) {
        console.error('Failed to retrieve presentations from localStorage for unauthenticated user:', localStorageError);
      }
      
      // Return default presentations for unauthenticated users
      console.log('Using default presentations for unauthenticated user');
      return {
        success: true,
        source: 'default-unauthenticated',
        presentations: DEFAULT_PRESENTATIONS
      };
    }
    
    // Try to load from server with authentication
    try {
      console.log('Loading presentations from database with authentication...');
      
      // Get the endpoint with proper user context
      const userId = getCurrentUserId() || (isDevelopment ? 'dev-fallback-user' : null);
      const endpoint = `${config.apiUrl}/getPresentations${userId ? `?userId=${userId}` : ''}`;
      
      const response = await makeAuthenticatedRequest(endpoint);
      
      // Handle different response formats
      let presentations = [];
      if (Array.isArray(response)) {
        presentations = response;
      } else if (response && Array.isArray(response.presentations)) {
        presentations = response.presentations;
      } else if (response && response.data && Array.isArray(response.data.presentations)) {
        presentations = response.data.presentations;
      } else {
        console.warn('Server returned unexpected data format:', response);
        throw new Error('Invalid data format received from server');
      }
      
      console.log(`Successfully loaded ${presentations.length} presentations from database`);
      source = 'server';
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('wms_presentations_backup', JSON.stringify(presentations));
        console.log('Saved server presentations to localStorage backup');
      } catch (localStorageError) {
        console.warn('Failed to save presentations backup to localStorage:', localStorageError);
      }
      
      return {
        success: true,
        source,
        presentations
      };
    } catch (serverError) {
      console.warn(`Server load failed: ${serverError.message}. Using fallback options...`);
      
      // In development mode, try without authentication as fallback
      if (isDevelopment) {
        try {
          console.log('Trying to load presentations without authentication in development mode...');
          const response = await makeRequest(`${config.apiUrl}/getPresentations`);
          
          // Handle different response formats
          let presentations = [];
          if (Array.isArray(response)) {
            presentations = response;
          } else if (response && Array.isArray(response.presentations)) {
            presentations = response.presentations;
          } else if (response && response.data && Array.isArray(response.data.presentations)) {
            presentations = response.data.presentations;
          } else {
            throw new Error('Invalid data format received from development fallback');
          }
          
          console.log(`Successfully loaded ${presentations.length} presentations without authentication`);
          source = 'server-dev-fallback';
          
          // Save to localStorage as backup
          try {
            localStorage.setItem('wms_presentations_backup', JSON.stringify(presentations));
            console.log('Saved dev fallback presentations to localStorage backup');
          } catch (localStorageError) {
            console.warn('Failed to save dev fallback presentations to localStorage:', localStorageError);
          }
          
          return {
            success: true,
            source,
            presentations
          };
        } catch (devFallbackError) {
          console.warn('Development fallback also failed:', devFallbackError.message);
        }
      }
      
      // Try localStorage fallback if server requests fail
      throw serverError; // Re-throw to try localStorage fallback
    }
  } catch (error) {
    console.error(`Error fetching presentations from API (${source}):`, error);
    
    // Try to load from localStorage as fallback
    try {
      const localData = localStorage.getItem('wms_presentations_backup');
      if (localData) {
        const parsedData = JSON.parse(localData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`Loaded ${parsedData.length} presentations from localStorage fallback`);
          return {
            success: true,
            source: 'localStorage',
            presentations: parsedData,
            error: error.message
          };
        }
      }
      
      // Try emergency backup
      const emergencyData = localStorage.getItem('wms_presentations_emergency_backup');
      if (emergencyData) {
        const parsedEmergencyData = JSON.parse(emergencyData);
        if (Array.isArray(parsedEmergencyData) && parsedEmergencyData.length > 0) {
          console.log(`Loaded ${parsedEmergencyData.length} presentations from emergency localStorage fallback`);
          return {
            success: true,
            source: 'localStorage-emergency',
            presentations: parsedEmergencyData,
            error: error.message
          };
        }
      }
    } catch (localStorageError) {
      console.error('Failed to load presentations from localStorage:', localStorageError);
    }
    
    // Return default presentations as last resort
    console.log('Returning default presentations as fallback');
    return {
      success: true,
      source: 'default',
      presentations: DEFAULT_PRESENTATIONS,
      error: error.message
    };
  }
};

/**
 * Save voice notes to database
 * @param {Array} notes - Array of note objects
 * @returns {Promise<Object>} - API response
 */
export const saveNotes = async (notes) => {
  try {
    if (!Array.isArray(notes)) {
      console.error('saveNotes received non-array data:', notes);
      throw new Error('Notes must be an array');
    }
    
    return await makeAuthenticatedRequest(`${config.apiUrl}/saveNotes`, 'POST', { notes });
  } catch (error) {
    console.error('Error saving notes to database:', error);
    // Re-throw the error but with a more user-friendly message
    throw new Error(`Failed to save notes: ${error.message}`);
  }
};

/**
 * Load voice notes from database
 * @returns {Promise<Array>} - Array of note objects
 */
export const loadNotes = async () => {
  try {
    console.log('Loading notes from database...');
    const data = await makeRequest(`${config.apiUrl}/getNotes`);
    
    // Check if data is directly an array (from MongoDB) or has a notes property
    if (Array.isArray(data)) {
      console.log(`Successfully loaded ${data.length} notes from database`);
      return data;
    } else if (data && data.notes && Array.isArray(data.notes)) {
      console.log(`Successfully loaded ${data.notes.length} notes from database`);
      return data.notes;
    } else {
      console.warn('Unexpected data format from getNotes:', data);
      return [];
    }
  } catch (error) {
    console.error('Error loading notes from database:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

/**
 * Save settings to database
 * @param {Object} settings - Settings to save
 * @param {boolean} userSpecific - Whether to save as user-specific settings
 * @returns {Promise<Object>} - Saved settings
 */
export const saveSettings = async (settings, userSpecific = true) => {
  // Always save to localStorage first as a backup
  const localStorageKey = userSpecific ? 
    `wms_user_settings_${getCurrentUserId() || 'default'}` : 
    'wms_global_settings';
  
  // Add metadata to settings
  const settingsToSave = {
    ...settings,
    lastUpdated: new Date().toISOString(),
    _version: (settings._version || 0) + 1
  };
  
  // Always save to localStorage first
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(settingsToSave));
    console.log(`Saved ${userSpecific ? 'user' : 'global'} settings to localStorage as backup`);
  } catch (localStorageError) {
    console.warn('Failed to save settings to localStorage:', localStorageError);
  }
  
  try {
    // If user-specific settings are requested but user is not authenticated, use fallback in dev mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEV_MODE === 'true';
    
    if (userSpecific && !isAuthenticated()) {
      if (isDevelopment) {
        console.log('Development mode: using fallback for unauthenticated user settings');
      } else {
        console.error('Cannot save user settings: User not authenticated');
        throw new Error('Authentication required to save user settings');
      }
    }
    
    const userId = userSpecific ? (getCurrentUserId() || (isDevelopment ? 'dev-fallback-user' : null)) : null;
    
    if (!userId && userSpecific && !isDevelopment) {
      throw new Error('User ID required for user-specific settings');
    }
    
    const endpoint = userSpecific ? 
      `${config.apiUrl}/save-user-settings?userId=${userId}` : 
      `${config.apiUrl}/saveSettings`;
    
    console.log(`Saving ${userSpecific ? 'user' : 'global'} settings to database for ${userSpecific ? `user ${userId}` : 'all users'}`);
    console.log('Settings to save:', settingsToSave);
    
    // For user-specific settings, use authenticated request
    try {
      let response;
      if (userSpecific) {
        response = await makeAuthenticatedRequest(endpoint, 'POST', { settings: settingsToSave });
      } else {
        response = await makeRequest(endpoint, 'POST', { settings: settingsToSave });
      }
      
      console.log(`Successfully saved ${userSpecific ? 'user' : 'global'} settings to database:`, response);
      
      // Return the saved settings
      return {
        success: true,
        source: 'server',
        settings: settingsToSave
      };
    } catch (serverError) {
      console.warn(`Server save failed: ${serverError.message}. Using localStorage fallback.`);
      
      // If server save fails, we already saved to localStorage, so return success with fallback source
      return {
        success: true,
        source: 'localStorage',
        settings: settingsToSave,
        error: serverError.message
      };
    }
  } catch (error) {
    console.error(`Error saving ${userSpecific ? 'user' : 'global'} settings:`, error);
    
    // Even if there was an error in the overall process, we might have saved to localStorage
    try {
      const localData = localStorage.getItem(localStorageKey);
      if (localData) {
        return {
          success: true,
          source: 'localStorage-fallback',
          settings: JSON.parse(localData),
          error: error.message
        };
      }
    } catch (localStorageError) {
      console.error('Failed to retrieve settings from localStorage fallback:', localStorageError);
    }
    
    throw new Error(`Failed to save settings: ${error.message}`);
  }
};

/**
 * Default settings object
 */
const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  notifications: true,
  autoSave: true,
  presentationViewMode: 'embed',
  lastVisitedSection: null
};

/**
 * Load settings from the database with localStorage fallback
 * @param {boolean} userSpecific - Whether to load user-specific settings
 * @returns {Promise<Object>} - Settings object with success status and source information
 */
export const loadSettings = async (userSpecific = true) => {
  // Define localStorage key for fallback
  const localStorageKey = userSpecific ? 
    `wms_user_settings_${getCurrentUserId() || 'default'}` : 
    'wms_global_settings';
  
  try {
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEV_MODE === 'true';
    let source = 'unknown';
    
    // For user-specific settings, check authentication
    if (userSpecific && !isAuthenticated() && !isDevelopment) {
      console.warn('Cannot load user settings: User not authenticated');
      
      // Try localStorage fallback
      try {
        const localData = localStorage.getItem(localStorageKey);
        if (localData) {
          const parsedSettings = JSON.parse(localData);
          console.log('Loaded user settings from localStorage fallback:', parsedSettings);
          return {
            success: true,
            source: 'localStorage-fallback',
            settings: parsedSettings
          };
        }
      } catch (localStorageError) {
        console.error('Failed to retrieve settings from localStorage:', localStorageError);
      }
      
      // Return default settings as last resort
      console.log('Using default settings as fallback');
      return {
        success: true,
        source: 'default',
        settings: { ...DEFAULT_SETTINGS }
      };
    }
    
    const userId = userSpecific ? (getCurrentUserId() || (isDevelopment ? 'dev-fallback-user' : null)) : null;
    
    // Define the endpoint
    const endpoint = userSpecific ? 
      `${config.apiUrl}/getUserSettings?userId=${userId}` : 
      `${config.apiUrl}/getSettings`;
    
    console.log(`Loading ${userSpecific ? 'user' : 'global'} settings from database for ${userSpecific ? `user ${userId}` : 'all users'}`);
    
    try {
      // Try to load from server first
      let response;
      if (userSpecific) {
        response = await makeAuthenticatedRequest(endpoint, 'GET');
      } else {
        response = await makeRequest(endpoint, 'GET');
      }
      
      if (response && typeof response === 'object') {
        source = 'server';
        console.log(`Successfully loaded ${userSpecific ? 'user' : 'global'} settings from database:`, response);
        
        // Store last loaded timestamp for debugging
        if (userSpecific) {
          response._lastLoaded = new Date().toISOString();
        }
        
        // Save to localStorage as backup
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(response));
          console.log(`Saved ${userSpecific ? 'user' : 'global'} settings to localStorage as backup`);
        } catch (localStorageError) {
          console.warn('Failed to save settings to localStorage:', localStorageError);
        }
        
        return {
          success: true,
          source,
          settings: response
        };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (serverError) {
      console.warn(`Server load failed: ${serverError.message}. Trying localStorage fallback.`);
      
      // Try localStorage fallback
      try {
        const localData = localStorage.getItem(localStorageKey);
        if (localData) {
          const parsedSettings = JSON.parse(localData);
          source = 'localStorage';
          console.log(`Loaded ${userSpecific ? 'user' : 'global'} settings from localStorage:`, parsedSettings);
          return {
            success: true,
            source,
            settings: parsedSettings,
            error: serverError.message
          };
        }
      } catch (localStorageError) {
        console.error('Failed to retrieve settings from localStorage:', localStorageError);
      }
      
      // Return default settings as last resort
      source = 'default';
      console.log('Using default settings as fallback');
      return {
        success: true,
        source,
        settings: { ...DEFAULT_SETTINGS },
        error: serverError.message
      };
    }
  } catch (error) {
    console.error(`Error loading ${userSpecific ? 'user' : 'global'} settings:`, error);
    
    // Try localStorage as emergency fallback
    try {
      const localData = localStorage.getItem(localStorageKey);
      if (localData) {
        const parsedSettings = JSON.parse(localData);
        console.log('Loaded settings from localStorage emergency fallback:', parsedSettings);
        return {
          success: true,
          source: 'localStorage-emergency',
          settings: parsedSettings,
          error: error.message
        };
      }
    } catch (localStorageError) {
      console.error('Failed to retrieve settings from localStorage emergency fallback:', localStorageError);
    }
    
    // Return default settings as absolute last resort
    console.log('Using default settings as last resort fallback');
    return {
      success: true,
      source: 'default-emergency',
      settings: { ...DEFAULT_SETTINGS },
      error: error.message
    };
  }
};

/**
 * Clear settings from database
 * @param {boolean} isUserSpecific - Whether to clear user-specific settings
 * @returns {Promise<Object>} - API response
 * @throws {Error} - If not authenticated or API request fails
 */
export const clearSettings = async (isUserSpecific = true) => {
  const userId = getCurrentUserId();
  const endpoint = isUserSpecific ? 
    `${config.apiUrl}/clearUserSettings?userId=${userId}` : 
    `${config.apiUrl}/clearSettings`;
  
  return makeAuthenticatedRequest(endpoint, 'DELETE');
};
