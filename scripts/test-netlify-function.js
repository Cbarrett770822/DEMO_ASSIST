// Test script for Netlify functions

// Import handlers with try/catch to handle potential import errors
let getPresentationsHandler, getProcessesHandler, loginHandler;

try {
  getPresentationsHandler = require('../netlify/functions/getPresentations').handler;
  console.log('Successfully imported getPresentations handler');
} catch (error) {
  console.error('Error importing getPresentations handler:', error.message);
}

try {
  getProcessesHandler = require('../netlify/functions/getProcesses').handler;
  console.log('Successfully imported getProcesses handler');
} catch (error) {
  console.error('Error importing getProcesses handler:', error.message);
}

try {
  loginHandler = require('../netlify/functions/login').handler;
  console.log('Successfully imported login handler');
} catch (error) {
  console.error('Error importing login handler:', error.message);
}

// Mock event and context objects
const mockEvent = {
  httpMethod: 'GET',
  headers: {}
};

const mockContext = {
  callbackWaitsForEmptyEventLoop: true
};

// Test login function
async function testLogin() {
  console.log('\n--- Testing Login Function ---');
  
  const loginEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  };
  
  try {
    const response = await loginHandler(loginEvent, mockContext);
    console.log(`Status code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      console.log('Login successful!');
      console.log(`User: ${body.user.username}`);
      console.log(`Role: ${body.user.role}`);
      console.log(`Token available: ${!!body.token}`);
      
      // Return the token for subsequent tests
      return body.token;
    } else {
      console.log(`Login failed: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.error('Error testing login function:', error);
    return null;
  }
}

// Test presentations function
async function testGetPresentations(token) {
  console.log('\n--- Testing Get Presentations Function ---');
  
  const event = { ...mockEvent };
  
  // Add authorization header if token is provided
  if (token) {
    event.headers = {
      authorization: `Bearer ${token}`
    };
  }
  
  try {
    const response = await getPresentationsHandler(event, mockContext);
    console.log(`Status code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      console.log(`Presentations source: ${body.source}`);
      console.log(`Number of presentations: ${body.presentations.length}`);
      
      if (body.presentations.length > 0) {
        console.log('\nSample presentation:');
        console.log(`- Title: ${body.presentations[0].title}`);
        console.log(`- URL: ${body.presentations[0].url}`);
      }
    } else {
      console.log(`Error: ${response.body}`);
    }
  } catch (error) {
    console.error('Error testing presentations function:', error);
  }
}

// Test processes function
async function testGetProcesses(token) {
  console.log('\n--- Testing Get Processes Function ---');
  
  const event = { ...mockEvent };
  
  // Add authorization header if token is provided
  if (token) {
    event.headers = {
      authorization: `Bearer ${token}`
    };
  }
  
  try {
    const response = await getProcessesHandler(event, mockContext);
    console.log(`Status code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      console.log(`Processes source: ${body.source}`);
      console.log(`Number of processes: ${body.processes.length}`);
      
      if (body.processes.length > 0) {
        console.log('\nSample process:');
        console.log(`- Title: ${body.processes[0].title}`);
        console.log(`- Category: ${body.processes[0].category}`);
      }
    } else {
      console.log(`Error: ${response.body}`);
    }
  } catch (error) {
    console.error('Error testing processes function:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Netlify functions tests...');
  
  try {
    // First test login if available
    let token = null;
    if (loginHandler) {
      token = await testLogin();
    } else {
      console.log('Skipping login test - handler not available');
    }
    
    // Then test the other functions with the token if available
    if (getPresentationsHandler) {
      await testGetPresentations(token);
    } else {
      console.log('Skipping presentations test - handler not available');
    }
    
    if (getProcessesHandler) {
      await testGetProcesses(token);
    } else {
      console.log('Skipping processes test - handler not available');
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();
