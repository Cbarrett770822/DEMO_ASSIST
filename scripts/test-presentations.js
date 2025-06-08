const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8889/.netlify/functions';
const AUTH_TOKEN = '64a65c1a9d7d3e6a0f9b0e01:admin:admin'; // Using admin user

// Test presentation data
const testPresentation = {
  id: '1',
  title: 'WMS Introduction (Updated)',
  url: 'https://example.com/custom-presentation-url.pptx',
  description: 'A custom URL for testing presentation updates',
  isLocal: false,
  fileType: 'pptx',
  sourceType: 'other'
};

// Headers with authentication
const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function runTests() {
  console.log('Starting presentation tests...');
  
  try {
    // Step 1: Get current presentations
    console.log('\n1. Getting current presentations...');
    const initialResponse = await axios.get(`${API_BASE_URL}/getPresentations`, { headers });
    console.log(`Initial presentations count: ${initialResponse.data.presentations.length}`);
    
    if (initialResponse.data.presentations.length > 0) {
      console.log('Current presentation URLs:');
      initialResponse.data.presentations.forEach(p => {
        console.log(`- ${p.title}: ${p.url}`);
      });
    } else {
      console.log('No presentations found initially');
    }
    
    // Step 2: Save a presentation with a custom URL
    console.log('\n2. Saving presentation with custom URL...');
    const saveResponse = await axios.post(
      `${API_BASE_URL}/savePresentations`,
      [testPresentation],
      { headers }
    );
    
    console.log('Save response:', saveResponse.data);
    
    // Step 3: Get presentations again to verify the save worked
    console.log('\n3. Getting presentations after save...');
    const afterSaveResponse = await axios.get(`${API_BASE_URL}/getPresentations`, { headers });
    
    console.log(`Presentations after save: ${afterSaveResponse.data.presentations.length}`);
    if (afterSaveResponse.data.presentations.length > 0) {
      console.log('Updated presentation URLs:');
      afterSaveResponse.data.presentations.forEach(p => {
        console.log(`- ${p.title}: ${p.url}`);
      });
      
      // Check if our custom URL was saved
      const savedPresentation = afterSaveResponse.data.presentations.find(p => p.id === testPresentation.id);
      if (savedPresentation) {
        console.log('\nVerification:');
        console.log(`Expected URL: ${testPresentation.url}`);
        console.log(`Actual URL: ${savedPresentation.url}`);
        console.log(`URL saved correctly: ${savedPresentation.url === testPresentation.url ? 'YES ✓' : 'NO ✗'}`);
      } else {
        console.log('Could not find the saved presentation by ID');
      }
    }
    
    // Step 4: Update the presentation with a different URL
    console.log('\n4. Updating presentation with a different URL...');
    const updatedPresentation = {
      ...testPresentation,
      url: 'https://example.com/updated-presentation-url.pptx',
      description: 'This URL was updated in a second save operation'
    };
    
    const updateResponse = await axios.post(
      `${API_BASE_URL}/savePresentations`,
      [updatedPresentation],
      { headers }
    );
    
    console.log('Update response:', updateResponse.data);
    
    // Step 5: Get presentations one more time to verify the update worked
    console.log('\n5. Getting presentations after update...');
    const finalResponse = await axios.get(`${API_BASE_URL}/getPresentations`, { headers });
    
    if (finalResponse.data.presentations.length > 0) {
      console.log('Final presentation URLs:');
      finalResponse.data.presentations.forEach(p => {
        console.log(`- ${p.title}: ${p.url}`);
      });
      
      // Check if our updated URL was saved
      const updatedSavedPresentation = finalResponse.data.presentations.find(p => p.id === updatedPresentation.id);
      if (updatedSavedPresentation) {
        console.log('\nFinal Verification:');
        console.log(`Expected URL: ${updatedPresentation.url}`);
        console.log(`Actual URL: ${updatedSavedPresentation.url}`);
        console.log(`URL updated correctly: ${updatedSavedPresentation.url === updatedPresentation.url ? 'YES ✓' : 'NO ✗'}`);
      } else {
        console.log('Could not find the updated presentation by ID');
      }
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

runTests();
