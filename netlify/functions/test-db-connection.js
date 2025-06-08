const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');

// Use the correct MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

exports.handler = async (event, context) => {
  console.log('Test DB Connection function called');
  console.log('Environment:', process.env.NODE_ENV || 'not set');
  console.log('MongoDB URI available:', !!process.env.MONGODB_URI);
  console.log('Development mode:', process.env.NODE_ENV === 'development' || !process.env.NODE_ENV ? 'yes' : 'no');
  console.log('DISABLE_DEV_FALLBACK:', process.env.DISABLE_DEV_FALLBACK);
  console.log('DEBUG_DB_CONNECTION:', process.env.DEBUG_DB_CONNECTION);
  console.log('MongoDB URI:', MONGODB_URI.replace(/:\/\/(.*):(.*)@/, '://***:***@'));

  try {
    // Try to connect to the database
    const db = await connectToDatabase();
    
    // If we get here, connection was successful
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Database connection successful',
        dbInfo: {
          readyState: db.connection.readyState,
          host: db.connection.host,
          name: db.connection.name,
          useMockData: false
        }
      })
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          codeName: error.codeName
        }
      })
    };
  }
};
