/**
 * Test script to debug the login endpoint
 * This script tests the login process without requiring a token
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
  console.log('Starting Login Endpoint Test...');
  console.log(`API Base URL: ${config.apiUrl}`);
  
  // Step 1: Test login endpoint
  console.log('\nStep 1: Testing /login endpoint');
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
    
    let responseText = await loginResponse.text();
    console.log('Raw response:', responseText);
    
    try {
      const loginData = JSON.parse(responseText);
      console.log('Login Response (parsed):', JSON.stringify(loginData, null, 2));
      
      if (loginData.token) {
        console.log('Token received:', loginData.token);
        console.log('✓ LOGIN SUCCESS');
        
        // Step 2: Test token with getUserSettings
        console.log('\nStep 2: Testing token with getUserSettings');
        const token = loginData.token;
        
        // Test without Bearer prefix
        console.log('\nTesting without Bearer prefix');
        const settingsResponse1 = await fetch(`${config.apiUrl}/get-user-settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
        
        console.log(`Status: ${settingsResponse1.status}`);
        const settingsData1 = await settingsResponse1.json();
        console.log('Response:', JSON.stringify(settingsData1, null, 2));
        
        // Test with Bearer prefix
        console.log('\nTesting with Bearer prefix');
        const settingsResponse2 = await fetch(`${config.apiUrl}/get-user-settings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`Status: ${settingsResponse2.status}`);
        const settingsData2 = await settingsResponse2.json();
        console.log('Response:', JSON.stringify(settingsData2, null, 2));
      } else {
        console.log('✗ LOGIN FAILED - No token in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('✗ LOGIN FAILED - Invalid JSON response');
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    console.log('✗ LOGIN FAILED');
  }
  
  console.log('\n-----------------------------------');
  console.log('\nTests completed');
}

// Run the tests
main().catch(console.error);
