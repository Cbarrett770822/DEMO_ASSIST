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
  // Only allow DELETE requests
  if (event.httpMethod !== 'DELETE') {
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
  
  try {
    // Verify token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (decodeError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Invalid token format',
          message: 'The authentication token is malformed'
        })
      };
    }
    
    // Check if token is expired
    if (tokenData.exp < Date.now()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        })
      };
    }
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Get user ID from query parameters or token
    const userId = event.queryStringParameters?.userId || tokenData.userId;
    
    // Create model
    const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
    
    // Delete user settings
    await UserSettings.deleteOne({ userId });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User settings cleared successfully'
      })
    };
  } catch (error) {
    console.error('Error clearing user settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to clear user settings',
        message: error.message
      })
    };
  }
};
