const { connectToDatabase } = require('./utils/mongodb');
const Presentation = require('./models/Presentation');

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
    const presentations = JSON.parse(event.body);
    
    // Delete all existing presentations
    await Presentation.deleteMany({});
    
    // Insert the new presentations
    await Presentation.insertMany(presentations);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Presentations saved successfully' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
