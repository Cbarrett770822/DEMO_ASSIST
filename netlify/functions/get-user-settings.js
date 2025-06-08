const { connectToDatabase } = require('./utils/mongodb');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Debug mode for detailed logging
const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true' || true;

// Define UserSettings schema if it doesn't exist
const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  settings: {
    type: Object,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create or get the model
const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);

exports.handler = async (event, context) => {
  // Set up CORS headers for cross-origin requests
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
      headers
    };
  }
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (DEBUG_AUTH) {
      console.log('Request headers:', JSON.stringify(event.headers));
      console.log('Query parameters:', JSON.stringify(event.queryStringParameters || {}));
    }
    
    // Get token from Authorization header
    const authHeader = event.headers.authorization || '';
    
    if (DEBUG_AUTH) {
      console.log('Raw Authorization header:', authHeader);
    }
    
    // Extract token, handling both "Bearer token" and direct token formats
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix
      if (DEBUG_AUTH) {
        console.log('Bearer prefix detected and removed');
      }
    } else {
      token = authHeader.trim(); // Use the entire header as the token
      if (DEBUG_AUTH) {
        console.log('No Bearer prefix detected');
      }
    }
    
    if (!token) {
      console.error('No token provided in Authorization header');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Authorization token is missing or invalid',
          message: 'Please log in to access this resource'
        })
      };
    }
    
    if (DEBUG_AUTH) {
      console.log('Extracted token:', token);
    }
    
    // Try to verify token - support multiple token formats
    let userId;
    let username;
    let role;
    
    // Check if it's our simplified token format (userId:username:role)
    if (token.includes(':')) {
      try {
        const parts = token.split(':');
        if (parts.length >= 3) {
          userId = parts[0];
          username = parts[1];
          role = parts[2];
          if (DEBUG_AUTH) {
            console.log('Simplified token parsed successfully:', { userId, username, role });
          }
        } else {
          throw new Error('Invalid simplified token format');
        }
      } catch (tokenError) {
        console.error('Simplified token parsing failed:', tokenError);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid token format', 
            message: 'The authentication token is invalid or malformed'
          })
        };
      }
    } else {
      // Try JWT verification for legacy tokens
      try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        userId = decodedToken.userId || decodedToken.sub;
        username = decodedToken.username || decodedToken.name;
        role = decodedToken.role;
        if (DEBUG_AUTH) {
          console.log('JWT token verified successfully:', { userId, username, role });
        }
      } catch (jwtError) {
        // If JWT verification fails, try base64 decoding (for dev mode)
        try {
          const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
          
          // Check if token is expired
          if (tokenData.exp && tokenData.exp < Date.now()) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ 
                error: 'Token expired', 
                message: 'Your session has expired. Please log in again.'
              })
            };
          }
          
          userId = tokenData.userId || tokenData.sub;
          username = tokenData.username || tokenData.name;
          role = tokenData.role;
          if (DEBUG_AUTH) {
            console.log('Base64 token decoded successfully:', { userId, username, role });
          }
        } catch (base64Error) {
          // Check if it's a development fallback token
          if (token.startsWith('dev-fallback-')) {
            // Extract username from token
            const parts = token.split('-');
            if (parts.length >= 3) {
              username = parts[2];
              userId = `${username}-dev-id`;
              role = username === 'admin' ? 'admin' : 'user';
              if (DEBUG_AUTH) {
                console.log('Development fallback token parsed successfully:', { userId, username, role });
              }
            } else if (token === 'dev-fallback') {
              // Handle legacy dev-fallback token without username
              username = 'admin';
              userId = 'admin-dev-id';
              role = 'admin';
              if (DEBUG_AUTH) {
                console.log('Legacy development fallback token parsed successfully:', { userId, username, role });
              }
            } else {
              console.error('Token verification failed for all formats');
              return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                  error: 'Invalid token format', 
                  message: 'The authentication token is invalid or malformed'
                })
              };
            }
          } else {
            console.error('Token verification failed for all formats');
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ 
                error: 'Invalid token format', 
                message: 'The authentication token is invalid or malformed'
              })
            };
          }
        }
      }
    }
    
    // Ensure we have a userId
    if (!userId) {
      console.error('No user ID could be extracted from token');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token: no user ID' })
      };
    }
    
    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Error connecting to database:', dbError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database connection error', 
          message: process.env.NODE_ENV === 'development' ? dbError.message : undefined 
        })
      };
    }
    
    try {
      // Check if we should get settings for a specific user (admin feature)
      const queryParams = event.queryStringParameters || {};
      let targetUserId = userId;
      
      if (queryParams.userId && queryParams.userId !== userId) {
        // If requesting settings for another user, check if current user is admin
        console.log(`User role check: ${role}, username: ${username}`);
        
        // Check if user is admin either by role or by username
        const isAdmin = role === 'admin' || username === 'admin';
        
        if (isAdmin) {
          targetUserId = queryParams.userId;
          console.log(`Admin ${userId} requesting settings for user ${targetUserId}`);
        } else {
          console.warn(`User ${userId} attempted to access settings for ${queryParams.userId} without admin privileges`);
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ 
              error: 'Not authorized to access settings for another user',
              userRole: role,
              username: username,
              requestedUserId: queryParams.userId
            })
          };
        }
      }
      
      // Find user settings
      const userSettings = await UserSettings.findOne({ userId: targetUserId });
      
      // Return settings or empty object if not found
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          settings: userSettings ? userSettings.settings : {},
          userId: targetUserId,
          requestedBy: userId,
          timestamp: new Date().toISOString()
        })
      };
    } catch (dbOperationError) {
      console.error('Error during database operation:', dbOperationError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database operation failed', 
          message: process.env.NODE_ENV === 'development' ? dbOperationError.message : undefined 
        })
      };
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    
    // Handle token verification errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get user settings',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined 
      })
    };
  }
};
