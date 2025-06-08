/**
 * Update Admin Role Function
 * 
 * This serverless function updates the admin user's role to ensure it's properly set.
 */

const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Parse the request body
    const { username } = JSON.parse(event.body);
    
    // Validate input
    if (!username) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username is required' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'User role updated successfully',
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      })
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update user role' })
    };
  }
};
