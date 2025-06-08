/**
 * Test script to debug the full authentication flow
 * This script tests the login process and subsequent API calls
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

// Main function
async function main() {
  console.log('Starting Authentication Flow Test...');
  console.log(`API Base URL: ${config.apiUrl}`);
  
  // Step 1: Login
  console.log('\nStep 1: Login');
  let token = null;
  try {
    const loginResponse = await fetch(`${config.apiUrl}/authenticate`, {
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
        console.log('Token received:', token);
        console.log('✓ LOGIN SUCCESS');
      } else {
        console.log('✗ LOGIN FAILED - No token in response');
      }
    } else {
      console.log('✗ LOGIN FAILED');
      const errorData = await loginResponse.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    console.log('✗ LOGIN FAILED');
  }
  
  if (!token) {
    console.log('Cannot proceed without token');
    return;
  }
  
  console.log('\n-----------------------------------');
  
  // Step 2: Test token parsing
  console.log('\nStep 2: Test Token Parsing');
  try {
    const tokenResponse = await fetch(`${config.apiUrl}/test-token-parsing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
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
  
  // Step 3: Test getUserSettings
  console.log('\nStep 3: Test getUserSettings');
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
      console.log('✓ GET USER SETTINGS SUCCESS');
    } else {
      console.log('✗ GET USER SETTINGS FAILED');
    }
  } catch (error) {
    console.error('getUserSettings Error:', error.message);
    console.log('✗ GET USER SETTINGS FAILED');
  }
  
  console.log('\n-----------------------------------');
  
  // Step 4: Test with Bearer prefix
  console.log('\nStep 4: Test with Bearer prefix');
  try {
    const bearerResponse = await fetch(`${config.apiUrl}/get-user-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const bearerStatus = bearerResponse.status;
    console.log(`Bearer Status: ${bearerStatus}`);
    
    const bearerData = await bearerResponse.json();
    console.log('Bearer Response:', JSON.stringify(bearerData, null, 2));
    
    if (bearerStatus === 200) {
      console.log('✓ BEARER PREFIX SUCCESS');
    } else {
      console.log('✗ BEARER PREFIX FAILED');
    }
  } catch (error) {
    console.error('Bearer Error:', error.message);
    console.log('✗ BEARER PREFIX FAILED');
  }
  
  console.log('\n-----------------------------------');
  console.log('\nTests completed');
}

// Run the tests
main().catch(console.error);
