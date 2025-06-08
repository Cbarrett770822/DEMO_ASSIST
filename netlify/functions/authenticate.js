/**
 * Authenticate Function
 * 
 * This serverless function verifies authentication tokens and returns user information.
 * It supports both JWT tokens and simplified tokens (userId:username:role format).
 * It's used to validate authentication state and retrieve user data.
 */

const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const mongoose = require('mongoose');
const UserSettings = require('./models/UserSettings');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI;
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// MongoDB Atlas connection string (hardcoded as fallback)
const MONGODB_ATLAS_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';

// Debug information
console.log('Authenticate function initialized');
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('MongoDB URI available:', !!MONGODB_URI);
console.log('JWT Secret available:', !!JWT_SECRET);
console.log('Development mode:', isDevelopment ? 'yes' : 'no');

// Function to validate MongoDB URI format
function validateMongoDBUri(uri) {
  if (!uri) return 'MongoDB URI is not defined';
  
  // Basic format validation
  const validFormat = /^mongodb(\+srv)?:\/\/.+:.+@.+\/.+$/;
  if (!validFormat.test(uri)) {
    return 'MongoDB URI format is invalid. Expected format: mongodb(+srv)://username:password@host/database';
  }
  
  return null; // No error
}

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
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
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
      present: !!MONGODB_URI,
      valid: validateMongoDBUri(MONGODB_URI) === null,
      error: validateMongoDBUri(MONGODB_URI)
    },
    jwtSecret: {
      present: !!JWT_SECRET,
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
  
  let user = null;
  let decoded = null;
  let userSettings = null;

  try {
    // Extract the token from the Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    // Check for development fallback tokens
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    const defaultUsers = ['admin', 'user', 'supervisor'];
    const defaultRoles = {'admin': 'admin', 'user': 'user', 'supervisor': 'supervisor'};
    
    // Check if this is a development fallback token
    let usingDevFallback = false;
    let devFallbackUser = null;
    
    if (isDevelopment && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Check if token matches our dev fallback pattern
      for (const username of defaultUsers) {
        if (token === `dev-fallback-${username}` || token === 'dev-fallback-token') {
          console.log(`Using development fallback for ${username} authentication`);
          usingDevFallback = true;
          devFallbackUser = {
            _id: `${username}-dev-id`,
            id: `${username}-dev-id`,
            username: username,
            role: defaultRoles[username] || 'user',
            createdAt: new Date()
          };
          break;
        }
      }
      
      // Check if token is in our simplified format (userId:username:role)
      if (!usingDevFallback && token.includes(':')) {
        const parts = token.split(':');
        if (parts.length >= 3) {
          console.log('Using simplified token format');
          console.log(`Token parts: userId=${parts[0]}, username=${parts[1]}, role=${parts[2]}`);
          usingDevFallback = true;
          devFallbackUser = {
            _id: parts[0],
            id: parts[0],
            username: parts[1],
            role: parts[2],
            createdAt: new Date()
          };
          
          // For admin users, always ensure role is explicitly set to 'admin'
          if (parts[1] === 'admin' && parts[2] !== 'admin') {
            console.log('Correcting role for admin user');
            devFallbackUser.role = 'admin';
          }
        } else {
          console.warn('Invalid simplified token format. Expected format: userId:username:role');
        }
      }
    }
    
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
    
    // Skip JWT verification for our simplified authentication system
    if (!usingDevFallback) {
      // If not using development fallback or simplified token, try to parse as JWT for backward compatibility
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        diagnostics.token = {
          valid: true,
          decoded: {
            exp: decoded.exp,
            iat: decoded.iat,
            userId: decoded.userId
          }
        };
      } catch (jwtError) {
        console.log('Not a valid JWT token, but this is expected with simplified auth:', jwtError.message);
        // For simplified auth, we don't need to verify JWT tokens
        // Instead, we'll check if the user exists in the database
        diagnostics.token = {
          valid: false,
          error: 'Not a JWT token, using simplified authentication',
          simplified: true
        };
        
        // Try to extract user ID from token if it's in a format we can understand
        if (token.includes(':')) {
          const parts = token.split(':');
          if (parts.length >= 1) {
            decoded = { userId: parts[0] };
            diagnostics.token.simplified = true;
            diagnostics.token.simplifiedFormat = 'userId:username:role';
          }
        }
        
        // If we couldn't extract a user ID, return an error
        if (!decoded || !decoded.userId) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              authenticated: false,
              error: 'Invalid token format',
              message: 'Authentication token format is not recognized.',
              diagnostics
            })
          };
        }
      }
    }

    // If using development fallback, create a user object without database
    if (usingDevFallback) {
      user = devFallbackUser;
      
      // Create default settings for fallback user
      userSettings = {
        settings: {
          theme: 'light',
          fontSize: 'medium',
          notifications: true,
          autoSave: true,
          presentationViewMode: 'embed',
          lastVisitedSection: null
        }
      };
      diagnostics.settingsCreated = true;
      diagnostics.usingDevFallback = true;
    } else {
      // Connect to MongoDB for non-fallback users
      try {
        // Connect to MongoDB
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          });
        }
        diagnostics.dbConnected = true;
        
        // Find user by ID from the decoded token
        const userId = decoded.userId;
        diagnostics.userId = userId;
        
        try {
          user = await User.findById(userId);
          diagnostics.userLookup = { attempted: true, found: !!user };
        } catch (findError) {
          console.log('Error finding user by ID:', findError.message);
          diagnostics.userLookup = { attempted: true, error: findError.message };
        }
        
        if (!user) {
          // If in development mode and user not found, create a fallback user
          if (isDevelopment) {
            diagnostics.usingDbFallback = true;
            
            // If we have a token in userId:username:role format, extract the username and role
            let username = 'user';
            let role = 'user';
            
            if (token.includes(':')) {
              const parts = token.split(':');
              if (parts.length >= 3) {
                username = parts[1];
                role = parts[2];
              }
            }
            
            user = {
              _id: userId,
              id: userId,
              username: username,
              role: role,
              createdAt: new Date().toISOString()
            };
            diagnostics.userFound = true;
          } else {
            diagnostics.errors.push(`User not found with ID: ${userId}`);
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                success: false,
                message: 'User not found',
                diagnostics
              })
            };
          }
        } else {
          diagnostics.userFound = true;
          
          // Ensure admin user always has admin role
          if (user.username === 'admin' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            diagnostics.adminRoleFixed = true;
          }
          
          // Try to find user settings
          try {
            userSettings = await UserSettings.findOne({ userId: user._id });
            if (userSettings) {
              diagnostics.settingsFound = true;
            } else {
              // Create default settings if not found
              userSettings = new UserSettings({
                userId: user._id,
                settings: {
                  theme: 'light',
                  fontSize: 'medium',
                  notifications: true,
                  autoSave: true,
                  presentationViewMode: 'embed',
                  lastVisitedSection: null
                }
              });
              await userSettings.save();
              diagnostics.settingsCreated = true;
            }
          } catch (settingsError) {
            diagnostics.errors.push(`Error finding/creating user settings: ${settingsError.message}`);
            // Continue without settings
          }
        }
      } catch (dbError) {
        diagnostics.errors.push(`Database error: ${dbError.message}`);
        
        // If in development mode, fall back to default users
        if (isDevelopment) {
          diagnostics.usingDbFallback = true;
          user = {
            _id: userId,
            id: userId,
            username: username,
            role: role,
            createdAt: new Date().toISOString()
          };
          
          // Create default settings for fallback user
          userSettings = {
            settings: {
              theme: 'light',
              fontSize: 'medium',
              notifications: true,
              autoSave: true,
              presentationViewMode: 'embed',
              lastVisitedSection: null
            }
          };
          diagnostics.settingsCreated = true;
        } else {
          // In production, return error
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Database error',
              error: dbError.message,
              diagnostics
            })
          };
        }
      }
    }

    // Generate simplified token format
    const simplifiedToken = `${user._id}:${user.username}:${user.role || 'user'}`;
    
    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        authenticated: true,
        message: 'Authentication successful',
        token: simplifiedToken, // Include the simplified token format
        user: {
          id: user._id,
          username: user.username,
          role: user.role || 'user', // Ensure role is always set, default to 'user'
          createdAt: user.createdAt
        },
        settings: userSettings ? userSettings.settings : null, // Include settings in the response if available
        diagnostics
      })
    };
  } catch (error) {
    // Handle any unexpected errors
    diagnostics.errors.push(`Unexpected error: ${error.message}`);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error',
        error: error.message,
        diagnostics
      })
    };
  }
};
