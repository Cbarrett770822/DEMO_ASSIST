/**
 * Test Authentication Endpoints
 * 
 * This script tests the authentication endpoints to verify they work with simplified token format.
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:8889/.netlify/functions';
const AUTH_TOKEN = '683c2b77574c7e1e14a34655:admin:admin'; // Use a valid MongoDB ObjectId format
const USER_ID = '683c2b77574c7e1e14a34655';

// Test endpoints
const endpoints = [
  '/test-authentication',
  '/authenticate'
];

// Special test for getUserSettings
const getUserSettingsEndpoint = `/get-user-settings?userId=${USER_ID}`;

async function testEndpoint(endpoint) {
  console.log(`Testing endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status: ${status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { endpoint, status, success: status >= 200 && status < 300, data };
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error);
    return { endpoint, success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Starting authentication endpoint tests...');
  console.log(`Using token: ${AUTH_TOKEN}`);
  
  // Test standard endpoints
  for (const endpoint of endpoints) {
    console.log('\n' + '='.repeat(50));
    const result = await testEndpoint(endpoint);
    console.log('='.repeat(50) + '\n');
  }
  
  // Test getUserSettings endpoint specifically
  console.log('\n' + '='.repeat(50));
  console.log(`Testing special endpoint: ${getUserSettingsEndpoint}`);
  try {
    const response = await fetch(`${API_BASE_URL}${getUserSettingsEndpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status: ${status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error testing ${getUserSettingsEndpoint}:`, error);
  }
  console.log('='.repeat(50) + '\n');
  
  console.log('Tests completed');
}

// Run the tests
runTests();
