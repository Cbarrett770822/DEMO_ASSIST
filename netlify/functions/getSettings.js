const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');

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
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Create model
    const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', GlobalSettingsSchema);
    
    // Find global settings
    const globalSettings = await GlobalSettings.findOne({ id: 'global' });
    
    // If no settings found, return default settings
    if (!globalSettings) {
      const defaultSettings = {
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        autoSave: true,
        presentationViewMode: 'embed'
      };
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          settings: defaultSettings,
          message: 'Default global settings returned'
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        settings: globalSettings.settings,
        updatedAt: globalSettings.updatedAt,
        message: 'Global settings retrieved successfully'
      })
    };
  } catch (error) {
    console.error('Error retrieving global settings:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to retrieve global settings',
        message: error.message
      })
    };
  }
};
