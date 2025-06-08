const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');

// Use the correct MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    // Try to connect to MongoDB
    console.log('Testing MongoDB connection...');
    const db = await connectToDatabase();
    
    // Check connection status
    const connectionState = mongoose.connection.readyState;
    const connectionStateText = ['disconnected', 'connected', 'connecting', 'disconnecting'][connectionState] || 'unknown';
    
    // Get environment info (without exposing sensitive data)
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      CONNECTION_STRING_FORMAT: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://***:***@') : 
        'not available'
    };
    
    // Get database info
    let dbInfo = {};
    if (connectionState === 1) { // Connected
      try {
        const admin = mongoose.connection.db.admin();
        const serverInfo = await admin.serverInfo();
        dbInfo = {
          version: serverInfo.version,
          engine: serverInfo.versionArray ? `MongoDB ${serverInfo.versionArray[0]}.${serverInfo.versionArray[1]}` : 'Unknown'
        };
      } catch (error) {
        dbInfo = { error: 'Could not get database info: ' + error.message };
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: connectionState === 1,
        connectionState: connectionStateText,
        connectionStateCode: connectionState,
        environment: envInfo,
        database: dbInfo,
        message: connectionState === 1 ? 
          'Successfully connected to MongoDB' : 
          'Failed to connect to MongoDB'
      })
    };
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        message: 'Failed to connect to MongoDB: ' + error.message
      })
    };
  }
};
