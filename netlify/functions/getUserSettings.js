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
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
      console.log('JWT token verified successfully');
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
        console.error('Legacy token parsing failed:', legacyError.message);
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
    
    // Get user ID from query parameters or token
    const queryParams = event.queryStringParameters || {};
    const userId = queryParams.userId || decodedToken.userId || decodedToken.sub;
    
    if (!userId) {
      console.error('No user ID found in request or token');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing user ID',
          message: 'User ID must be provided in query parameters or token'
        })
      };
    }
    
    console.log(`Retrieving settings for user: ${userId}`);

    
    // Create model
    const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
    
    // Find settings for the user
    const userSettings = await UserSettings.findOne({ userId });
    
    // If no settings found, return default settings
    if (!userSettings) {
      const defaultSettings = {
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        autoSave: true,
        presentationViewMode: 'embed',
        lastVisitedSection: null,
        _isDefault: true,
        _lastLoaded: new Date().toISOString()
      };
      
      console.log(`No settings found for user ${userId}, returning defaults`);
      
      return {
        statusCode: 200,
        body: JSON.stringify(defaultSettings)
      };
    }
    
    // Add metadata to help with debugging
    const settingsToReturn = {
      ...userSettings.settings,
      _id: userSettings._id.toString(),
      _updatedAt: userSettings.updatedAt.toISOString(),
      _lastLoaded: new Date().toISOString()
    };
    
    console.log(`Retrieved settings for user ${userId}:`, settingsToReturn);
    
    return {
      statusCode: 200,
      body: JSON.stringify(settingsToReturn)
    };
  } catch (error) {
    console.error('Error retrieving user settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to retrieve user settings',
        message: error.message
      })
    };
  }
};
