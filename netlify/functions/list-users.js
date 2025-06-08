/**
 * List Users Function
 * 
 * This serverless function retrieves all users from the database
 * and returns their usernames and roles.
 */

const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    const { db, dbError } = await connectToDatabase();
    if (dbError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database connection error',
          message: `Failed to connect to database: ${dbError.message}`
        })
      };
    }
    
    // Find all users
    const users = await User.find({}, 'username email role createdAt');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email || '',
          role: user.role || 'user',
          createdAt: user.createdAt
        }))
      })
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
};
