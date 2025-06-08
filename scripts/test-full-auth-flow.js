/**
 * Comprehensive test script for the full authentication and user settings flow
 * This script tests:
 * 1. Login process
 * 2. Token handling (with and without Bearer prefix)
 * 3. User settings retrieval
 * 4. User settings saving
 * 5. Token verification
 */

const fetch = require('node-fetch');
const config = {
  apiUrl: 'http://localhost:8889/api'
};

// Test credentials
const credentials = {
  username: 'admin',
  password: 'password'
};

// Test settings to save
const testSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  dashboardLayout: 'expanded',
  _metadata: {
    lastSaved: new Date().toISOString(),
    clientVersion: '1.0.0',
    tokenType: 'simplified'
  }
};

// Main function
async function main() {
  console.log('Starting Full Authentication Flow Test...');
  console.log(`API Base URL: ${config.apiUrl}`);
  console.log('Test timestamp:', new Date().toISOString());
  
  // Step 1: Login
  console.log('\n===== Step 1: Login =====');
  let token = null;
  let userId = null;
  
  try {
    const loginResponse = await fetch(`${config.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const loginStatus = loginResponse.status;
    console.log(`Login Status: ${loginStatus}`);
    
    if (loginStatus === 200) {
      const loginData = await loginResponse.json();
      console.log('Login Response:', JSON.stringify(loginData, null, 2));
      
      if (loginData.token) {
        token = loginData.token;
        userId = loginData.user.id;
        console.log('Token received:', token);
        console.log('User ID:', userId);
        console.log('✓ LOGIN SUCCESS');
      } else {
        console.log('✗ LOGIN FAILED - No token in response');
        return;
      }
    } else {
      console.log('✗ LOGIN FAILED');
      const errorData = await loginResponse.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
      return;
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    console.log('✗ LOGIN FAILED');
    return;
  }
  
  console.log('\n-----------------------------------');
  
  // Step 2: Test token parsing
  console.log('\n===== Step 2: Test Token Parsing =====');
  try {
    const tokenResponse = await fetch(`${config.apiUrl}/test-token-parsing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const tokenStatus = tokenResponse.status;
    console.log(`Token Parsing Status: ${tokenStatus}`);
    
    const tokenData = await tokenResponse.json();
    console.log('Token Parsing Response:', JSON.stringify(tokenData, null, 2));
    
    if (tokenStatus === 200) {
      console.log('✓ TOKEN PARSING SUCCESS');
    } else {
      console.log('✗ TOKEN PARSING FAILED');
    }
  } catch (error) {
    console.error('Token Parsing Error:', error.message);
    console.log('✗ TOKEN PARSING FAILED');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 3: Test getUserSettings with Bearer prefix
  console.log('\n===== Step 3: Test getUserSettings with Bearer prefix =====');
  try {
    const settingsResponse = await fetch(`${config.apiUrl}/get-user-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const settingsStatus = settingsResponse.status;
    console.log(`getUserSettings Status: ${settingsStatus}`);
    
    const settingsData = await settingsResponse.json();
    console.log('getUserSettings Response:', JSON.stringify(settingsData, null, 2));
    
    if (settingsStatus === 200) {
      console.log('✓ GET USER SETTINGS SUCCESS (Bearer prefix)');
    } else {
      console.log('✗ GET USER SETTINGS FAILED (Bearer prefix)');
    }
  } catch (error) {
    console.error('getUserSettings Error:', error.message);
    console.log('✗ GET USER SETTINGS FAILED (Bearer prefix)');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 4: Test getUserSettings without Bearer prefix
  console.log('\n===== Step 4: Test getUserSettings without Bearer prefix =====');
  try {
    const settingsResponse = await fetch(`${config.apiUrl}/get-user-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });
    
    const settingsStatus = settingsResponse.status;
    console.log(`getUserSettings Status: ${settingsStatus}`);
    
    const settingsData = await settingsResponse.json();
    console.log('getUserSettings Response:', JSON.stringify(settingsData, null, 2));
    
    if (settingsStatus === 200) {
      console.log('✓ GET USER SETTINGS SUCCESS (without Bearer prefix)');
    } else {
      console.log('✗ GET USER SETTINGS FAILED (without Bearer prefix)');
    }
  } catch (error) {
    console.error('getUserSettings Error:', error.message);
    console.log('✗ GET USER SETTINGS FAILED (without Bearer prefix)');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 5: Test saveUserSettings with Bearer prefix
  console.log('\n===== Step 5: Test saveUserSettings with Bearer prefix =====');
  try {
    // Add metadata to settings
    testSettings._metadata.lastSaved = new Date().toISOString();
    testSettings._metadata.userId = userId;
    testSettings._metadata.username = credentials.username;
    
    const saveResponse = await fetch(`${config.apiUrl}/save-user-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ settings: testSettings })
    });
    
    const saveStatus = saveResponse.status;
    console.log(`saveUserSettings Status: ${saveStatus}`);
    
    const saveData = await saveResponse.json();
    console.log('saveUserSettings Response:', JSON.stringify(saveData, null, 2));
    
    if (saveStatus === 200) {
      console.log('✓ SAVE USER SETTINGS SUCCESS (Bearer prefix)');
    } else {
      console.log('✗ SAVE USER SETTINGS FAILED (Bearer prefix)');
    }
  } catch (error) {
    console.error('saveUserSettings Error:', error.message);
    console.log('✗ SAVE USER SETTINGS FAILED (Bearer prefix)');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 6: Test saveUserSettings without Bearer prefix
  console.log('\n===== Step 6: Test saveUserSettings without Bearer prefix =====');
  try {
    // Update timestamp for this test
    testSettings._metadata.lastSaved = new Date().toISOString();
    
    const saveResponse = await fetch(`${config.apiUrl}/save-user-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ settings: testSettings })
    });
    
    const saveStatus = saveResponse.status;
    console.log(`saveUserSettings Status: ${saveStatus}`);
    
    const saveData = await saveResponse.json();
    console.log('saveUserSettings Response:', JSON.stringify(saveData, null, 2));
    
    if (saveStatus === 200) {
      console.log('✓ SAVE USER SETTINGS SUCCESS (without Bearer prefix)');
    } else {
      console.log('✗ SAVE USER SETTINGS FAILED (without Bearer prefix)');
    }
  } catch (error) {
    console.error('saveUserSettings Error:', error.message);
    console.log('✗ SAVE USER SETTINGS FAILED (without Bearer prefix)');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 7: Verify saved settings were persisted
  console.log('\n===== Step 7: Verify saved settings were persisted =====');
  try {
    const verifyResponse = await fetch(`${config.apiUrl}/get-user-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const verifyStatus = verifyResponse.status;
    console.log(`Verification Status: ${verifyStatus}`);
    
    const verifyData = await verifyResponse.json();
    console.log('Verification Response:', JSON.stringify(verifyData, null, 2));
    
    if (verifyStatus === 200) {
      // Check if the theme matches what we saved
      if (verifyData.settings && verifyData.settings.theme === testSettings.theme) {
        console.log('✓ SETTINGS VERIFICATION SUCCESS - Theme matches');
      } else {
        console.log('✗ SETTINGS VERIFICATION FAILED - Theme does not match');
        console.log('Expected:', testSettings.theme);
        console.log('Received:', verifyData.settings ? verifyData.settings.theme : 'undefined');
      }
    } else {
      console.log('✗ SETTINGS VERIFICATION FAILED - Could not retrieve settings');
    }
  } catch (error) {
    console.error('Verification Error:', error.message);
    console.log('✗ SETTINGS VERIFICATION FAILED');
  }
  
  console.log('\n-----------------------------------');
  console.log('\nTests completed');
}

// Run the tests
main().catch(console.error);
