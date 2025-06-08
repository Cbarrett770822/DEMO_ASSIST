const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const mongoose = require('mongoose');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to validate MongoDB URI format
function validateMongoDBUri(uri) {
  if (!uri) return 'MongoDB URI is missing';
  if (typeof uri !== 'string') return 'MongoDB URI must be a string';
  if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
    return 'MongoDB URI must start with mongodb:// or mongodb+srv://';
  }
  return null;
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
  
  // Collect diagnostic information
  const diagnostics = {
    environment: process.env.NODE_ENV || 'unknown',
    mongodbUri: {
      present: !!process.env.MONGODB_URI,
      valid: validateMongoDBUri(process.env.MONGODB_URI) === null,
      error: validateMongoDBUri(process.env.MONGODB_URI)
    },
    jwtSecret: {
      present: !!process.env.JWT_SECRET,
      usingDefault: !process.env.JWT_SECRET
    },
    timestamp: new Date().toISOString(),
    requestInfo: {
      method: event.httpMethod,
      path: event.path,
      hasAuthHeader: !!(event.headers.authorization || event.headers.Authorization),
      queryStringParameters: event.queryStringParameters || {}
    }
  };

  try {
    // Extract the token from the Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          authenticated: false,
          error: 'No authentication token provided',
          message: 'Authentication token is missing. Please include a Bearer token in the Authorization header.',
          diagnostics
        })
      };
    }

    const token = authHeader.split(' ')[1];
    diagnostics.token = {
      present: true,
      length: token.length
    };
    
    // Variables to store user information
    let userId, username, role;
    let tokenType = 'unknown';
    let tokenValid = false;
    
    // Check if it's a simplified token format (userId:username:role)
    if (token.includes(':')) {
      try {
        const parts = token.split(':');
        if (parts.length >= 3) {
          userId = parts[0];
          username = parts[1];
          role = parts[2];
          tokenValid = true;
          tokenType = 'simplified';
          
          diagnostics.token.decoded = {
            valid: true,
            tokenType: 'simplified',
            userId: userId,
            username: username,
            role: role
          };
        } else {
          throw new Error('Invalid simplified token format');
        }
      } catch (error) {
        diagnostics.token.decoded = {
          valid: false,
          tokenType: 'simplified-invalid',
          error: error.message
        };
      }
    }
    
    // If not a valid simplified token, try JWT verification
    if (!tokenValid) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        username = decoded.username;
        role = decoded.role;
        tokenValid = true;
        tokenType = 'jwt';
        
        diagnostics.token.decoded = {
          valid: true,
          tokenType: 'jwt',
          userId: decoded.userId,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'missing',
          iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'missing'
        };
      } catch (error) {
        // Only return error if we haven't already validated as simplified token
        if (tokenType === 'unknown') {
          diagnostics.token.decoded = {
            valid: false,
            tokenType: 'jwt-invalid',
            error: error.message,
            name: error.name
          };
          
          // Check if it's a development fallback token
          if (token.startsWith('dev-fallback-')) {
            const parts = token.split('-');
            if (parts.length >= 3) {
              username = parts[2];
              userId = `${username}-dev-id`;
              role = username === 'admin' ? 'admin' : 'user';
              tokenValid = true;
              tokenType = 'dev-fallback';
              
              diagnostics.token.decoded = {
                valid: true,
                tokenType: 'dev-fallback',
                userId: userId,
                username: username,
                role: role
              };
            }
          }
          
          if (!tokenValid) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ 
                authenticated: false,
                error: 'Invalid token',
                message: `Token verification failed: ${error.message}`,
                tokenError: error.name,
                diagnostics
              })
            };
          }
        }
      }
    }
    
    // Check if we have a userId
    if (!userId) {
      diagnostics.token.decoded.missingUserId = true;
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          authenticated: false,
          error: 'Invalid token format',
          message: 'Token is missing required userId field',
          diagnostics
        })
      };
    }
    
    // Connect to the database
    try {
      const db = await connectToDatabase();
      diagnostics.database = {
        connected: true,
        connectionState: mongoose.connection.readyState,
        connectionStateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      };
    } catch (dbError) {
      diagnostics.database = {
        connected: false,
        error: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      };
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          authenticated: false,
          error: 'Database connection error',
          message: `Failed to connect to database: ${dbError.message}`,
          diagnostics
        })
      };
    }
    
    // Find user by userId
    let user;
    try {
      user = await User.findById(userId); // Use the userId extracted earlier instead of decoded.userId
      diagnostics.user = {
        found: !!user,
        id: user ? user._id.toString() : null
      };
    } catch (userError) {
      diagnostics.user = {
        error: userError.message,
        stack: process.env.NODE_ENV === 'development' ? userError.stack : undefined
      };
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          authenticated: false,
          error: 'User lookup error',
          message: `Error finding user: ${userError.message}`,
          diagnostics
        })
      };
    }
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          authenticated: false,
          error: 'User not found',
          message: 'The user associated with this token no longer exists',
          diagnostics
        })
      };
    }
    
    // Check for user settings in database
    try {
      // This would normally be in a separate collection, but we're checking if the database is properly set up
      const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', new mongoose.Schema({
        userId: String,
        settings: Object,
        lastUpdated: Date
      }));
      
      const userSettings = await UserSettings.findOne({ userId: user._id.toString() });
      diagnostics.userSettings = {
        found: !!userSettings,
        lastUpdated: userSettings ? userSettings.lastUpdated : null
      };
    } catch (settingsError) {
      diagnostics.userSettings = {
        error: settingsError.message
      };
    }
    
    // Return success response with token and user info (excluding sensitive data)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        authenticated: true,
        message: 'Authentication successful',
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        },
        token: {
          valid: true,
          type: tokenType,
          // For simplified tokens, we don't have expiration info
          ...(tokenType === 'jwt' ? {
            expires: new Date(decoded.exp * 1000).toISOString(),
            issuedAt: new Date(decoded.iat * 1000).toISOString(),
            timeRemaining: Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes'
          } : {})
        },
        diagnostics
      })
    };
  } catch (error) {
    console.error('Error testing authentication:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        authenticated: false,
        error: 'Server error',
        message: `Failed to test authentication: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        diagnostics
      })
    };
  }
};
