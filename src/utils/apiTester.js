/**
 * API Endpoint Tester Utility
 * 
 * This utility helps test API endpoints and diagnose connection issues
 * with MongoDB and authentication
 */
import { getAuthToken, getCurrentUserId, isAuthenticated } from '../services/dbStorageService';
import config from '../config';
import { getApiBaseUrl } from './environmentUtils';

/**
 * Test an API endpoint
 * @param {string} endpoint - API endpoint to test
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} body - Request body (for POST/PUT requests)
 * @param {boolean} forceAuth - Force authentication even for non-auth endpoints
 * @returns {Promise<Object>} - Test results
 */
export const testApiEndpoint = async (endpoint, method = 'GET', body = null, forceAuth = false) => {
  console.log(`Testing API endpoint: ${endpoint} (${method})`);
  
  const startTime = Date.now();
  const results = {
    endpoint,
    method,
    success: false,
    statusCode: null,
    responseTime: null,
    error: null,
    data: null,
    authState: {
      isAuthenticated: isAuthenticated(),
      hasToken: !!getAuthToken(),
      hasUserId: !!getCurrentUserId()
    }
  };
  
  try {
    // Prepare request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add authentication token if available
    const token = getAuthToken();
    const userId = getCurrentUserId();
    
    // Check authentication state
    if (forceAuth || endpoint.includes('User') || endpoint.includes('save')) {
      if (!token || !userId) {
        results.error = 'Authentication required for this endpoint but user is not authenticated';
        results.authError = true;
        return results;
      }
    }
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
      results.authenticated = true;
      
      // Add userId to query string for user-specific endpoints if not already present
      if (userId && endpoint.includes('User') && !endpoint.includes('userId=')) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint = `${endpoint}${separator}userId=${userId}`;
        results.endpoint = endpoint; // Update endpoint in results
      }
    } else {
      results.authenticated = false;
    }
    
    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`Making ${method} request to ${endpoint}`, options);
    
    // Make the request
    const response = await fetch(endpoint, options);
    results.statusCode = response.status;
    results.headers = {};
    
    // Get important headers
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('content') || key.toLowerCase().includes('auth')) {
        results.headers[key] = value;
      }
    }
    
    // Check content type to determine how to parse the response
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response
      try {
        const data = await response.json();
        results.data = data;
      } catch (jsonError) {
        results.parseError = `Failed to parse JSON: ${jsonError.message}`;
        const text = await response.text().catch(() => 'Unable to get response text');
        results.data = { text: text.substring(0, 500) }; // Limit text size
      }
    } else {
      // Handle non-JSON response
      const text = await response.text().catch(() => 'Unable to get response text');
      results.data = { text: text.substring(0, 500) }; // Limit text size
    }
    
    // Determine success
    results.success = response.ok;
    if (!response.ok) {
      results.error = results.data?.error || results.data?.message || response.statusText;
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        results.authError = true;
      }
    }
  } catch (error) {
    results.error = error.message;
    results.exception = error.name;
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      results.networkError = true;
    }
  } finally {
    results.responseTime = Date.now() - startTime;
  }
  
  console.log(`API test results for ${endpoint}:`, results);
  return results;
};

/**
 * Test all API endpoints
 * @param {boolean} includeAuthTests - Whether to include tests that require authentication
 * @returns {Promise<Object>} - Test results for all endpoints
 */
export const testAllEndpoints = async (includeAuthTests = true) => {
  // Get the API base URL
  const apiBaseUrl = getApiBaseUrl();
  console.log('Using API base URL for tests:', apiBaseUrl);
  
  // Basic endpoints that don't require authentication
  const basicEndpoints = [
    { name: 'Get Processes', endpoint: `${apiBaseUrl}/getProcesses`, method: 'GET' },
    { name: 'Get Presentations', endpoint: `${apiBaseUrl}/getPresentations`, method: 'GET' },
    { name: 'Get Settings', endpoint: `${apiBaseUrl}/getSettings`, method: 'GET' },
    { name: 'MongoDB Connection Test', endpoint: `${apiBaseUrl}/test-mongodb-connection`, method: 'GET' },
    { name: 'DB Connection Test', endpoint: `${apiBaseUrl}/test-db-connection`, method: 'GET' }
  ];
  
  // Endpoints that require authentication
  const authEndpoints = [
    { name: 'Get User Settings', endpoint: `${apiBaseUrl}/getUserSettings`, method: 'GET', requiresAuth: true },
    { name: 'Test Authentication', endpoint: `${apiBaseUrl}/test-authentication`, method: 'GET', requiresAuth: true }
  ];
  
  const endpoints = [...basicEndpoints, ...(includeAuthTests ? authEndpoints : [])];
  
  const results = {
    summary: {
      total: endpoints.length,
      successful: 0,
      failed: 0,
      authErrors: 0,
      networkErrors: 0
    },
    endpoints: {}
  };
  
  const userId = getCurrentUserId();
  
  for (const endpoint of endpoints) {
    // Add userId to user-specific endpoints if needed
    let endpointUrl = endpoint.endpoint;
    if (endpoint.requiresAuth && userId && endpointUrl.includes('User') && !endpointUrl.includes('userId=')) {
      const separator = endpointUrl.includes('?') ? '&' : '?';
      endpointUrl = `${endpointUrl}${separator}userId=${userId}`;
    }
    
    const testResult = await testApiEndpoint(endpointUrl, endpoint.method, null, endpoint.requiresAuth);
    results.endpoints[endpoint.name] = testResult;
    
    // Update summary
    if (testResult.success) {
      results.summary.successful++;
    } else {
      results.summary.failed++;
      
      if (testResult.authError) {
        results.summary.authErrors++;
      }
      
      if (testResult.networkError) {
        results.summary.networkErrors++;
      }
    }
  }
  
  console.log('API endpoint test summary:', results.summary);
  return results;
};

// Functions are already exported with export const
// No need for additional exports
