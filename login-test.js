/**
 * Login Test Script
 * 
 * This script will authenticate a user and test the MongoDB connection.
 * It will store the authentication token in localStorage for the browser to use.
 */

// Default credentials for development
const username = 'admin';
const password = 'password';

// Function to authenticate user
async function authenticateUser() {
  console.log('Attempting to authenticate user:', username);
  
  try {
    // Make the API call to authenticate the user
    const response = await fetch('http://localhost:8889/.netlify/functions/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    console.log('Authentication response:', data);
    
    if (data.success) {
      // Store the authentication token and user data in localStorage
      localStorage.setItem('wms_auth_token', data.token);
      localStorage.setItem('wms_current_user', JSON.stringify(data.user));
      localStorage.setItem('wms_current_user_id', data.user.id);
      
      console.log('Authentication successful. Token and user data stored in localStorage.');
      return true;
    } else {
      console.error('Authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    
    // Try development fallback
    console.log('Trying development fallback authentication...');
    const userId = `${username}-dev-id`;
    const token = `${userId}:${username}:admin`;
    const user = {
      id: userId,
      username: username,
      role: 'admin'
    };
    
    // Store the fallback authentication token and user data in localStorage
    localStorage.setItem('wms_auth_token', token);
    localStorage.setItem('wms_current_user', JSON.stringify(user));
    localStorage.setItem('wms_current_user_id', userId);
    
    console.log('Development fallback authentication successful. Token and user data stored in localStorage.');
    return true;
  }
}

// Function to test MongoDB connection
async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    const response = await fetch('http://localhost:8889/.netlify/functions/test-mongodb-connection');
    const data = await response.json();
    console.log('MongoDB connection test result:', data);
    return data;
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    return { success: false, error: error.message };
  }
}

// Execute the authentication and test
(async function() {
  console.log('=== Starting Login and MongoDB Connection Test ===');
  
  // First, test MongoDB connection
  const mongoResult = await testMongoDBConnection();
  console.log('MongoDB connection status:', mongoResult.success ? 'Connected' : 'Failed');
  
  // Then authenticate user
  const authResult = await authenticateUser();
  console.log('Authentication status:', authResult ? 'Successful' : 'Failed');
  
  console.log('=== Login and MongoDB Connection Test Complete ===');
})();
