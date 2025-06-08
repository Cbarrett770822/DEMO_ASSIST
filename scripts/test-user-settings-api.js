/**
 * Test script for the getUserSettings API endpoint
 * 
 * This script tests the /api/getUserSettings endpoint with various token formats
 * to diagnose the 401 Unauthorized error.
 */

require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = 'http://localhost:8889';
const DEFAULT_USER_ID = '683c2b77574c7e1e14a34655'; // Admin user ID
const DEFAULT_USERNAME = 'admin';
const DEFAULT_ROLE = 'admin';

// Test tokens in different formats
const tokens = {
  simplified: `${DEFAULT_USER_ID}:${DEFAULT_USERNAME}:${DEFAULT_ROLE}`,
  bearer: `${DEFAULT_USER_ID}:${DEFAULT_USERNAME}:${DEFAULT_ROLE}`,
  jwt: process.env.JWT_SECRET ? generateJwtToken() : null
};

// Helper function to generate a JWT token (simplified version)
function generateJwtToken() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      userId: DEFAULT_USER_ID, 
      username: DEFAULT_USERNAME, 
      role: DEFAULT_ROLE 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
}

// Helper function to log results
function logResult(testName, success, data, error = null) {
  if (success) {
    console.log(chalk.green(`✓ ${testName}: SUCCESS`));
    if (data) {
      console.log(chalk.gray('Response:'), typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
  } else {
    console.log(chalk.red(`✗ ${testName}: FAILED`));
    if (error) {
      if (error.response) {
        console.log(chalk.yellow('Status:'), error.response.status);
        console.log(chalk.yellow('Response:'), error.response.data);
      } else {
        console.log(chalk.yellow('Error:'), error.message);
      }
    }
  }
  console.log(chalk.gray('-----------------------------------'));
}

// Test the getUserSettings endpoint with different token formats
async function testGetUserSettings() {
  console.log(chalk.blue.bold('\nTesting getUserSettings API...'));
  
  // Test with simplified token format
  try {
    console.log(chalk.cyan('\nTest 1: Using simplified token format'));
    console.log(chalk.gray(`Token: ${tokens.simplified}`));
    
    const response = await axios.get(`${API_BASE_URL}/api/getUserSettings`, {
      headers: {
        'Authorization': tokens.simplified
      }
    });
    
    logResult('Simplified token', true, response.data);
  } catch (error) {
    logResult('Simplified token', false, null, error);
  }
  
  // Test with Bearer prefix
  try {
    console.log(chalk.cyan('\nTest 2: Using Bearer token format'));
    console.log(chalk.gray(`Token: Bearer ${tokens.bearer}`));
    
    const response = await axios.get(`${API_BASE_URL}/api/getUserSettings`, {
      headers: {
        'Authorization': `Bearer ${tokens.bearer}`
      }
    });
    
    logResult('Bearer token', true, response.data);
  } catch (error) {
    logResult('Bearer token', false, null, error);
  }
  
  // Test with JWT token if available
  if (tokens.jwt) {
    try {
      console.log(chalk.cyan('\nTest 3: Using JWT token format'));
      console.log(chalk.gray(`Token: ${tokens.jwt.substring(0, 20)}...`));
      
      const response = await axios.get(`${API_BASE_URL}/api/getUserSettings`, {
        headers: {
          'Authorization': `Bearer ${tokens.jwt}`
        }
      });
      
      logResult('JWT token', true, response.data);
    } catch (error) {
      logResult('JWT token', false, null, error);
    }
  } else {
    console.log(chalk.yellow('\nSkipping JWT token test - JWT_SECRET not available'));
  }
  
  // Test with userId parameter
  try {
    console.log(chalk.cyan('\nTest 4: Using userId parameter'));
    console.log(chalk.gray(`Token: ${tokens.simplified}`));
    console.log(chalk.gray(`UserId: ${DEFAULT_USER_ID}`));
    
    const response = await axios.get(`${API_BASE_URL}/api/getUserSettings?userId=${DEFAULT_USER_ID}`, {
      headers: {
        'Authorization': tokens.simplified
      }
    });
    
    logResult('With userId parameter', true, response.data);
  } catch (error) {
    logResult('With userId parameter', false, null, error);
  }
  
  // Test with no token (should fail)
  try {
    console.log(chalk.cyan('\nTest 5: No token (should fail)'));
    
    const response = await axios.get(`${API_BASE_URL}/api/getUserSettings`);
    
    logResult('No token', true, response.data);
  } catch (error) {
    logResult('No token', false, null, error);
  }
}

// Main function
async function main() {
  console.log(chalk.blue.bold('Starting User Settings API tests...'));
  console.log(chalk.gray('API Base URL:'), API_BASE_URL);
  
  try {
    await testGetUserSettings();
    console.log(chalk.green.bold('\nTests completed'));
  } catch (error) {
    console.error(chalk.red.bold('\nTest execution failed:'), error.message);
  }
}

// Run the tests
main();
