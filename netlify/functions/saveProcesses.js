const { connectToDatabase } = require('./utils/mongodb');
const Process = require('./models/Process');

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const processes = JSON.parse(event.body);
    
    // Delete all existing processes
    await Process.deleteMany({});
    
    // Insert the new processes
    await Process.insertMany(processes);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Processes saved successfully' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
