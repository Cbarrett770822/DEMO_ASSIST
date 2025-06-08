/**
 * Test script to debug token parsing issues
 * This script tests different token formats with the test-token-parsing endpoint
 */

const fetch = require('node-fetch');
const config = {
  apiUrl: 'http://localhost:8889/api'
};

// Test tokens
const tokens = {
  simplified: '683c2b77574c7e1e14a34655:admin:admin',
  bearerSimplified: 'Bearer 683c2b77574c7e1e14a34655:admin:admin',
  devFallback: 'dev-fallback-admin',
  bearerDevFallback: 'Bearer dev-fallback-admin',
  noToken: ''
};

// Test function
async function testTokenParsing(tokenType, token) {
  console.log(`\nTest: ${tokenType}`);
  console.log(`Token: ${token}`);
  
  try {
    const response = await fetch(`${config.apiUrl}/test-token-parsing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });
    
    const status = response.status;
    console.log(`Status: ${status}`);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (status === 200) {
      console.log('✓ SUCCESS');
    } else {
      console.log('✗ FAILED');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('✗ FAILED');
  }
  
  console.log('-----------------------------------');
}

// Main function
async function main() {
  console.log('Starting Token Parsing Debug Tests...');
  console.log(`API Base URL: ${config.apiUrl}`);
  
  // Test all token formats
  for (const [type, token] of Object.entries(tokens)) {
    await testTokenParsing(type, token);
  }
  
  console.log('\nTests completed');
}

// Run the tests
main().catch(console.error);
