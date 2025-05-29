const { connectToDatabase } = require('./utils/mongodb');
const Process = require('./models/Process');
const processData = require('../../src/features/processes/data/processData');

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all processes
    const processes = await Process.find({});
    
    // If no processes found, return default ones
    if (processes.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(processData)
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(processes)
    };
  } catch (error) {
    console.error('Database error:', error);
    
    // Return default processes on error
    return {
      statusCode: 200,
      body: JSON.stringify(processData)
    };
  }
};
