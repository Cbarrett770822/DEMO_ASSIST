/**
 * Test Authentication and Persistence with MongoDB Atlas
 * 
 * This script tests the authentication system and data persistence
 * in the WMS Tutorial Application with the MongoDB Atlas connection.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Set environment variables for MongoDB Atlas
process.env.MONGODB_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';
process.env.NODE_ENV = 'development';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

// Base URL for API calls (using Netlify Dev port)
const BASE_URL = 'http://localhost:8888/.netlify/functions';

// Test settings data
const TEST_SETTINGS = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  dashboardLayout: 'compact'
};

/**
 * Test login with the simplified token format
 */
async function testLogin() {
  console.log('\n=== Testing Login ===');
  
  try {
    console.log(`Attempting login with username: ${TEST_CREDENTIALS.username}`);
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    
    const status = response.status;
    console.log(`Login response status: ${status}`);
    
    const data = await response.json();
    
    console.log('Login response:', {
      success: data.success,
      message: data.message,
      tokenFormat: data.token ? (data.token.includes(':') ? 'simplified' : 'JWT') : 'none',
      user: data.user ? {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      } : null
    });
    
    if (data.success && data.token && data.user) {
      console.log('✅ Login successful!');
      return data;
    } else {
      console.log('❌ Login failed!');
      console.log('Error details:', data.message || 'No error message provided');
      return null;
    }
  } catch (error) {
    console.error('Error during login test:', error.message);
    return null;
  }
}

/**
 * Test authentication with the token
 */
async function testAuthentication(token) {
  console.log('\n=== Testing Authentication ===');
  
  if (!token) {
    console.log('❌ No token provided for authentication test.');
    return null;
  }
  
  try {
    console.log('Attempting to authenticate with token...');
    const response = await fetch(`${BASE_URL}/authenticate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status = response.status;
    console.log(`Authentication response status: ${status}`);
    
    const data = await response.json();
    
    console.log('Authentication response:', {
      authenticated: data.authenticated,
      user: data.user ? {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      } : null
    });
    
    if (data.authenticated && data.user) {
      console.log('✅ Authentication successful!');
      return data;
    } else {
      console.log('❌ Authentication failed!');
      console.log('Error details:', data.error || 'No error message provided');
      return null;
    }
  } catch (error) {
    console.error('Error during authentication test:', error.message);
    return null;
  }
}

/**
 * Test saving user settings
 */
async function testSaveSettings(token, userId) {
  console.log('\n=== Testing Save Settings ===');
  
  if (!token || !userId) {
    console.log('❌ No token or userId provided for save settings test.');
    return false;
  }
  
  try {
    console.log(`Attempting to save settings for user: ${userId}`);
    console.log('Settings data:', TEST_SETTINGS);
    
    const response = await fetch(`${BASE_URL}/save-user-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        settings: TEST_SETTINGS
      })
    });
    
    const status = response.status;
    console.log(`Save settings response status: ${status}`);
    
    const data = await response.json();
    
    console.log('Save settings response:', {
      success: data.success,
      message: data.message
    });
    
    if (data.success) {
      console.log('✅ Save settings successful!');
      return true;
    } else {
      console.log('❌ Save settings failed!');
      console.log('Error details:', data.message || 'No error message provided');
      return false;
    }
  } catch (error) {
    console.error('Error during save settings test:', error.message);
    return false;
  }
}

/**
 * Test getting user settings
 */
async function testGetSettings(token, userId) {
  console.log('\n=== Testing Get Settings ===');
  
  if (!token || !userId) {
    console.log('❌ No token or userId provided for get settings test.');
    return null;
  }
  
  try {
    console.log(`Attempting to get settings for user: ${userId}`);
    const response = await fetch(`${BASE_URL}/get-user-settings?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status = response.status;
    console.log(`Get settings response status: ${status}`);
    
    const data = await response.json();
    
    console.log('Get settings response:', {
      success: data.success,
      settings: data.settings
    });
    
    if (data.success && data.settings) {
      console.log('✅ Get settings successful!');
      
      // Compare with test settings
      const matches = Object.keys(TEST_SETTINGS).every(key => 
        data.settings[key] === TEST_SETTINGS[key]
      );
      
      if (matches) {
        console.log('✅ Settings match the test data!');
      } else {
        console.log('⚠️ Settings do not match the test data.');
        console.log('Expected:', TEST_SETTINGS);
        console.log('Received:', data.settings);
      }
      
      return data.settings;
    } else {
      console.log('❌ Get settings failed!');
      console.log('Error details:', data.message || 'No error message provided');
      return null;
    }
  } catch (error) {
    console.error('Error during get settings test:', error.message);
    return null;
  }
}

/**
 * Test getting presentations
 */
async function testGetPresentations(token) {
  console.log('\n=== Testing Get Presentations ===');
  
  if (!token) {
    console.log('❌ No token provided for get presentations test.');
    return null;
  }
  
  try {
    console.log('Attempting to get presentations...');
    const response = await fetch(`${BASE_URL}/getPresentations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const status = response.status;
    console.log(`Get presentations response status: ${status}`);
    
    const data = await response.json();
    
    console.log('Get presentations response:', {
      success: data.success,
      presentationsCount: data.presentations ? data.presentations.length : 0
    });
    
    if (data.success && data.presentations) {
      console.log('✅ Get presentations successful!');
      return data.presentations;
    } else {
      console.log('❌ Get presentations failed!');
      console.log('Error details:', data.message || 'No error message provided');
      return null;
    }
  } catch (error) {
    console.error('Error during get presentations test:', error.message);
    return null;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== WMS Tutorial Application Tests ===');
  console.log('Testing authentication and data persistence with MongoDB Atlas...');
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '[set]' : '[not set]');
  
  // Test login
  const loginData = await testLogin();
  if (!loginData) {
    console.log('❌ Login failed, cannot continue with tests.');
    return;
  }
  
  const { token, user } = loginData;
  
  // Wait a bit before the next test
  await sleep(1000);
  
  // Test authentication
  const authData = await testAuthentication(token);
  if (!authData) {
    console.log('❌ Authentication failed, cannot continue with tests.');
    return;
  }
  
  // Wait a bit before the next test
  await sleep(1000);
  
  // Test save settings
  const saveSettingsSuccess = await testSaveSettings(token, user.id);
  
  // Wait a bit before the next test
  await sleep(1000);
  
  // Test get settings
  const settings = await testGetSettings(token, user.id);
  
  // Wait a bit before the next test
  await sleep(1000);
  
  // Test get presentations
  const presentations = await testGetPresentations(token);
  
  // Final report
  console.log('\n=== Test Results Summary ===');
  console.log('Login:', loginData ? '✅ Success' : '❌ Failed');
  console.log('Authentication:', authData ? '✅ Success' : '❌ Failed');
  console.log('Save Settings:', saveSettingsSuccess ? '✅ Success' : '❌ Failed');
  console.log('Get Settings:', settings ? '✅ Success' : '❌ Failed');
  console.log('Get Presentations:', presentations ? '✅ Success' : '❌ Failed');
  
  console.log('\n=== Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
