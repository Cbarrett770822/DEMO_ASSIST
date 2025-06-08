const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define the GlobalSettings schema
const GlobalSettingsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: 'global',
    required: true
  },
  settings: {
    type: Object,
    default: {
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      autoSave: true,
      presentationViewMode: 'embed'
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
    
    // Check if user has admin role
    if (tokenData.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Admin access required',
          message: 'This operation requires administrator privileges'
        })
      };
    }
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Create model
    const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', GlobalSettingsSchema);
    
    // Delete global settings
    await GlobalSettings.deleteOne({ id: 'global' });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Global settings cleared successfully'
      })
    };
  } catch (error) {
    console.error('Error clearing global settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to clear global settings',
        message: error.message
      })
    };
  }
};
