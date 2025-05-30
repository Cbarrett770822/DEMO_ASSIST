const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Get authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authorization token required' })
      };
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get all users (excluding passwords)
    const users = await User.find().select('-password');
    
    // Return users
    return {
      statusCode: 200,
      body: JSON.stringify({ users })
    };
  } catch (error) {
    console.error('Error getting users:', error);
    
    // Check if token verification failed
    if (error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
    
    // Check if token expired
    if (error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get users' })
    };
  }
};
