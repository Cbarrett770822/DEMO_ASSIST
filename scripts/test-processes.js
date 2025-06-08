const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8889/.netlify/functions';
const AUTH_TOKEN = '64a65c1a9d7d3e6a0f9b0e01:admin:admin'; // Using admin user

// Create an axios instance with longer timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper function to retry API calls
async function retryApiCall(apiCall, maxRetries = 3, delay = 2000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);
      return await apiCall();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`Waiting ${delay/1000} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

// Test process data with steps
const testProcess = {
  id: 'test-process-1',
  title: 'Receiving Process (Updated)',
  name: 'Receiving Process (Updated)',  // Include both title and name for compatibility
  description: 'Process for receiving goods at the warehouse',
  category: 'Inbound',
  steps: [
    {
      id: '1',
      title: 'Truck Arrival',
      description: 'Truck arrives at the receiving dock',
      videoUrl: 'https://example.com/custom-video-url.mp4'
    },
    {
      id: '2',
      title: 'Unload Pallets',
      description: 'Unload pallets from the truck',
      videoUrl: 'https://example.com/custom-video-url2.mp4'
    }
  ]
};

// Main test function
async function runTests() {
  console.log('Starting process tests...\n');
  
  try {
    // 1. Get current processes
    console.log('1. Getting current processes...');
    const initialResponse = await retryApiCall(() => 
      api.get('/getProcesses')
    );
    
    if (!initialResponse.data.success) {
      throw new Error(`Failed to get processes: ${initialResponse.data.message}`);
    }
    
    const initialProcesses = initialResponse.data.processes || [];
    console.log(`Initial processes count: ${initialProcesses.length}`);
    
    // Display process titles and step counts
    console.log('Current process titles:');
    initialProcesses.forEach(process => {
      console.log(`- ${process.title || process.name}`);
      console.log(`  Steps: ${process.steps ? process.steps.length : 0}`);
    });
    
    // 2. Save a new process with custom steps
    console.log('\n2. Saving process with custom steps...');
    const saveResponse = await retryApiCall(() => 
      api.post('/saveProcesses', { processes: [testProcess] })
    );
    
    console.log('Save response:', saveResponse.data);
    
    if (!saveResponse.data.success) {
      throw new Error(`Failed to save process: ${saveResponse.data.message}`);
    }
    
    // 3. Get processes after save to verify
    console.log('\n3. Getting processes after save...');
    const afterSaveResponse = await retryApiCall(() => 
      api.get('/getProcesses')
    );
    
    if (!afterSaveResponse.data.success) {
      throw new Error(`Failed to get processes after save: ${afterSaveResponse.data.message}`);
    }
    
    const processesAfterSave = afterSaveResponse.data.processes || [];
    console.log(`Processes after save: ${processesAfterSave.length}`);
    
    // Display updated process titles
    console.log('Updated process titles:');
    processesAfterSave.forEach(process => {
      console.log(`- ${process.title || process.name}`);
      console.log(`  Steps: ${process.steps ? process.steps.length : 0}`);
    });
    
    // Find our test process
    const savedProcess = processesAfterSave.find(p => p.id === testProcess.id);
    
    // Verification
    console.log('\nVerification:');
    console.log(`Expected title: ${testProcess.title}`);
    console.log(`Actual title: ${savedProcess ? savedProcess.title : 'Not found'}`);
    console.log(`Title saved correctly: ${savedProcess && savedProcess.title === testProcess.title ? 'YES ✓' : 'NO ✗'}`);
    
    console.log('\nSteps verification:');
    console.log(`Expected steps: ${testProcess.steps.length}`);
    console.log(`Actual steps: ${savedProcess ? savedProcess.steps.length : 0}`);
    
    if (savedProcess && savedProcess.steps) {
      console.log('Step details:');
      savedProcess.steps.forEach((step, index) => {
        console.log(`- Step ${index + 1}: ${step.title}`);
        console.log(`  Video URL: ${step.videoUrl}`);
      });
    }
    
    // 4. Update the process with different steps
    console.log('\n4. Updating process with different steps...');
    const updatedProcess = {
      ...testProcess,
      title: 'Receiving Process (Updated Again)',
      steps: [
        ...testProcess.steps,
        {
          id: '3',
          title: 'Scan Barcodes',
          description: 'Scan all incoming barcodes',
          videoUrl: 'https://example.com/custom-video-url3.mp4'
        }
      ]
    };
    
    const updateResponse = await retryApiCall(() => 
      api.post('/saveProcesses', { processes: [updatedProcess] })
    );
    
    console.log('Update response:', updateResponse.data);
    
    if (!updateResponse.data.success) {
      throw new Error(`Failed to update process: ${updateResponse.data.message}`);
    }
    
    // 5. Get processes after update
    console.log('\n5. Getting processes after update...');
    const finalResponse = await retryApiCall(() => 
      api.get('/getProcesses')
    );
    
    if (!finalResponse.data.success) {
      throw new Error(`Failed to get processes after update: ${finalResponse.data.message}`);
    }
    
    const finalProcesses = finalResponse.data.processes || [];
    
    // Display final process titles
    console.log('Final process titles:');
    finalProcesses.forEach(process => {
      console.log(`- ${process.title || process.name}`);
      console.log(`  Steps: ${process.steps ? process.steps.length : 0}`);
    });
    
    // Find our updated test process
    const updatedSavedProcess = finalProcesses.find(p => p.id === updatedProcess.id);
    
    // Final verification
    console.log('\nFinal Verification:');
    console.log(`Expected title: ${updatedProcess.title}`);
    console.log(`Actual title: ${updatedSavedProcess ? updatedSavedProcess.title : 'Not found'}`);
    console.log(`Title updated correctly: ${updatedSavedProcess && updatedSavedProcess.title === updatedProcess.title ? 'YES ✓' : 'NO ✗'}`);
    
    console.log('\nSteps verification:');
    console.log(`Expected steps: ${updatedProcess.steps.length}`);
    console.log(`Actual steps: ${updatedSavedProcess ? updatedSavedProcess.steps.length : 0}`);
    console.log(`Steps count updated correctly: ${updatedSavedProcess && updatedSavedProcess.steps.length === updatedProcess.steps.length ? 'YES ✓' : 'NO ✗'}`);
    
    if (updatedSavedProcess && updatedSavedProcess.steps) {
      console.log('Updated step details:');
      updatedSavedProcess.steps.forEach((step, index) => {
        console.log(`- Step ${index + 1}: ${step.title}`);
        console.log(`  Video URL: ${step.videoUrl}`);
      });
    }
    
  } catch (error) {
    console.log('Test failed with error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    } else if (error.request) {
      console.log('No response received. Request details:', error.request._currentUrl);
    } else {
      console.log('Error details:', error);
    }
  }
}

runTests();
