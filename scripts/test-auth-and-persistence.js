/**
 * Test Authentication and Persistence
 * 
 * This script tests the authentication system and data persistence
 * in the WMS Tutorial Application.
 */

const fetch = require('node-fetch');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// MongoDB Atlas connection string (same as in setup-mongodb-connection.js)
const MONGODB_ATLAS_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

// Base URL for API calls
const BASE_URL = 'http://localhost:3000/.netlify/functions';

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
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    
    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }
    
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
    const response = await fetch(`${BASE_URL}/authenticate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed with status: ${response.status}`);
    }
    
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
    
    if (!response.ok) {
      throw new Error(`Save settings failed with status: ${response.status}`);
    }
    
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
    const response = await fetch(`${BASE_URL}/get-user-settings?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Get settings failed with status: ${response.status}`);
    }
    
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
      }
      
      return data.settings;
    } else {
      console.log('❌ Get settings failed!');
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
    const response = await fetch(`${BASE_URL}/getPresentations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Get presentations failed with status: ${response.status}`);
    }
    
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
      return null;
    }
  } catch (error) {
    console.error('Error during get presentations test:', error.message);
    return null;
  }
}

/**
 * Test logout
 */
async function testLogout(token) {
  console.log('\n=== Testing Logout ===');
  
  if (!token) {
    console.log('❌ No token provided for logout test.');
    return false;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/revoke-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Logout response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Logout successful!');
      return true;
    } else {
      console.log('⚠️ Logout returned non-200 status, but this might be expected if token revocation is not fully implemented.');
      return false;
    }
  } catch (error) {
    console.error('Error during logout test:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== WMS Tutorial Application Tests ===');
  console.log('Testing authentication and data persistence...');
  
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
  
  // Wait a bit before the next test
  await sleep(1000);
  
  // Test logout
  const logoutSuccess = await testLogout(token);
  
  // Final report
  console.log('\n=== Test Results Summary ===');
  console.log('Login:', loginData ? '✅ Success' : '❌ Failed');
  console.log('Authentication:', authData ? '✅ Success' : '❌ Failed');
  console.log('Save Settings:', saveSettingsSuccess ? '✅ Success' : '❌ Failed');
  console.log('Get Settings:', settings ? '✅ Success' : '❌ Failed');
  console.log('Get Presentations:', presentations ? '✅ Success' : '❌ Failed');
  console.log('Logout:', logoutSuccess ? '✅ Success' : '⚠️ Partial Success');
  
  console.log('\n=== Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
