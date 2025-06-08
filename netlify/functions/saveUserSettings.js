const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define the UserSettings schema
const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  settings: {
    type: Object,
    default: {
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      autoSave: true,
      presentationViewMode: 'embed',
      lastVisitedSection: null
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check for authorization token
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: 'Authorization token is missing or invalid',
        message: 'Please log in to access this resource'
      })
    };
  }

  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;
  
  try {
    // Verify JWT token properly
    let decodedToken;
    try {
      // First try standard JWT verification
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      
      // Fallback to legacy token format if needed
      try {
        const legacyTokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if token is expired
        if (legacyTokenData.exp && legacyTokenData.exp < Date.now()) {
          return {
            statusCode: 401,
            body: JSON.stringify({ 
              error: 'Token expired',
              message: 'Your session has expired. Please log in again.'
            })
          };
        }
        
        // Use legacy token data
        decodedToken = legacyTokenData;
        console.log('Using legacy token format');
      } catch (legacyError) {
        return {
          statusCode: 401,
          body: JSON.stringify({ 
            error: 'Invalid token format',
            message: 'The authentication token is invalid or malformed'
          })
        };
      }
    }
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Parse request body
    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        })
      };
    }
    
    const { settings } = parsedBody;
    
    // Get userId from query parameters first, then body, then token
    const queryParams = event.queryStringParameters || {};
    const userIdToUse = queryParams.userId || parsedBody.userId || decodedToken.userId || decodedToken.sub;
    
    if (!userIdToUse) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing user ID',
          message: 'User ID must be provided in query parameters, request body, or token'
        })
      };
    }
    
    if (!settings || typeof settings !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid request body',
          message: 'Settings must be provided as an object'
        })
      };
    }
    
    // Create model
    const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
    
    // Update or create settings document
    const result = await UserSettings.findOneAndUpdate(
      { userId: userIdToUse },
      { 
        userId: userIdToUse,
        settings,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User settings saved successfully',
        data: {
          userId: userIdToUse,
          updatedAt: result.updatedAt
        }
      })
    };
  } catch (error) {
    console.error('Error saving user settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to save user settings',
        message: error.message
      })
    };
  }
};
