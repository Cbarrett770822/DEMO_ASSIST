const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    // Get token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    // Handle both Bearer token format and direct token format
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }
    
    // Variables to store user information
    let userId, username, role;
    let isAdmin = false;
    
    // Check if it's a simplified token format (userId:username:role)
    if (token.includes(':')) {
      try {
        const parts = token.split(':');
        if (parts.length >= 3) {
          userId = parts[0];
          username = parts[1];
          role = parts[2];
          isAdmin = role === 'admin' || username === 'admin';
        } else {
          throw new Error('Invalid simplified token format');
        }
      } catch (error) {
        console.error('Error parsing simplified token:', error);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token format' })
        };
      }
    } else {
      // Try JWT verification
      try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.userId;
        username = decodedToken.username;
        role = decodedToken.role;
        isAdmin = role === 'admin';
      } catch (error) {
        // Check if it's a development fallback token
        if (token.startsWith('dev-fallback-')) {
          const parts = token.split('-');
          if (parts.length >= 3) {
            username = parts[2];
            userId = `${username}-dev-id`;
            role = username === 'admin' ? 'admin' : 'user';
            isAdmin = username === 'admin';
          } else {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ error: 'Invalid token format' })
            };
          }
        } else {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid or expired token' })
          };
        }
      }
    }
    
    // Check if user is admin
    if (!isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find all users (exclude passwords)
    const users = await User.find().select('-password');
    
    // Return users list
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }))
      })
    };
  } catch (error) {
    console.error('Error getting users:', error);
    
    // Handle token verification errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database connection error', details: error.message })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get users', details: process.env.NODE_ENV === 'development' ? error.message : undefined })
    };
  }
};
