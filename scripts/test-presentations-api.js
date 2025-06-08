// Test script for presentations API
require('dotenv').config();
const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:8889/.netlify/functions';
const AUTH_TOKEN = '683c2b77574c7e1e14a34655:admin:admin'; // Admin token

// Sample presentation data
const samplePresentation = {
  id: 'test-presentation-1',
  title: 'Test Presentation',
  description: 'A test presentation',
  url: 'https://example.com/test.pptx',
  userId: '683c2b77574c7e1e14a34655'
};

async function testSavePresentations() {
  console.log('Testing savePresentations API...');
  
  try {
    // Test saving a presentation
    const response = await fetch(`${API_BASE_URL}/savePresentations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({ 
        presentations: [samplePresentation],
        metadata: {
          userId: '683c2b77574c7e1e14a34655',
          username: 'admin'
        }
      })
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status: ${status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { status, success: status >= 200 && status < 300, data };
  } catch (error) {
    console.error('Error testing savePresentations:', error);
    return { success: false, error: error.message };
  }
}

async function testGetPresentations() {
  console.log('\nTesting getPresentations API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/getPresentations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log(`Status: ${status}`);
    console.log(`Found ${data.presentations ? data.presentations.length : 0} presentations`);
    
    if (data.presentations && data.presentations.length > 0) {
      console.log('First presentation:', JSON.stringify(data.presentations[0], null, 2));
    }
    
    return { status, success: status >= 200 && status < 300, data };
  } catch (error) {
    console.error('Error testing getPresentations:', error);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Starting presentations API tests...');
  console.log(`Using token: ${AUTH_TOKEN}`);
  
  // Test save presentations
  const saveResult = await testSavePresentations();
  
  // Test get presentations
  const getResult = await testGetPresentations();
  
  console.log('\nTests completed');
  console.log('Save presentations test:', saveResult.success ? 'SUCCESS' : 'FAILED');
  console.log('Get presentations test:', getResult.success ? 'SUCCESS' : 'FAILED');
}

// Run the tests
runTests();
