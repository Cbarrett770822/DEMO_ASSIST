/**
 * Test Authentication and MongoDB Connection
 * 
 * This script tests the authentication and MongoDB connection
 * by making direct API calls to the Netlify functions.
 */

const fetch = require('node-fetch');

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:8889/.netlify/functions',
  username: 'admin',
  password: 'password'
};

// Test MongoDB connection
async function testMongoDBConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    const response = await fetch(`${config.apiBaseUrl}/test-mongodb-connection`);
    const data = await response.json();
    
    console.log('MongoDB Connection Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    return data.success;
  } catch (error) {
    console.error('Error testing MongoDB connection:', error.message);
    return false;
  }
}

// Test DB connection
async function testDBConnection() {
  console.log('Testing DB connection...');
  
  try {
    const response = await fetch(`${config.apiBaseUrl}/test-db-connection`);
    const data = await response.json();
    
    console.log('DB Connection Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    return data.success;
  } catch (error) {
    console.error('Error testing DB connection:', error.message);
    return false;
  }
}

// Test authentication
async function testAuthentication(username, password) {
  console.log(`Testing authentication for user: ${username}`);
  
  try {
    const response = await fetch(`${config.apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    console.log('Authentication Response:');
    console.log(JSON.stringify(data, null, 2));
    
    return data.success ? data.token : null;
  } catch (error) {
    console.error('Error testing authentication:', error.message);
    return null;
  }
}

// Test authenticated endpoint
async function testAuthenticatedEndpoint(token) {
  if (!token) {
    console.log('No token available, skipping authenticated endpoint test');
    return false;
  }
  
  console.log('Testing authenticated endpoint...');
  
  try {
    // Use the authenticate endpoint which supports simplified token format
    const response = await fetch(`${config.apiBaseUrl}/authenticate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log('Authenticated Endpoint Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    return data.success;
  } catch (error) {
    console.error('Error testing authenticated endpoint:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Testing API and Authentication ===');
  console.log(`API Base URL: ${config.apiBaseUrl}`);
  
  // Test MongoDB connection
  const mongoDBConnected = await testMongoDBConnection();
  console.log(`MongoDB Connection: ${mongoDBConnected ? 'SUCCESS' : 'FAILED'}`);
  
  // Test DB connection
  const dbConnected = await testDBConnection();
  console.log(`DB Connection: ${dbConnected ? 'SUCCESS' : 'FAILED'}`);
  
  // Use default credentials
  const username = config.username;
  const password = config.password;
  console.log(`Testing with username: ${username}`);
  
  // Test authentication
  const token = await testAuthentication(username, password);
  console.log(`Authentication: ${token ? 'SUCCESS' : 'FAILED'}`);
  
  let authenticatedEndpointSuccess = false;
  if (token) {
    // Test authenticated endpoint
    authenticatedEndpointSuccess = await testAuthenticatedEndpoint(token);
    console.log(`Authenticated Endpoint: ${authenticatedEndpointSuccess ? 'SUCCESS' : 'FAILED'}`);
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`MongoDB Connection: ${mongoDBConnected ? 'SUCCESS' : 'FAILED'}`);
  console.log(`DB Connection: ${dbConnected ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Authentication: ${token ? 'SUCCESS' : 'FAILED'}`);
  
  if (token) {
    console.log(`Authenticated Endpoint: ${authenticatedEndpointSuccess ? 'SUCCESS' : 'FAILED'}`);
  }
}

// Run the tests
runTests();
