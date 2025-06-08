const mongoose = require('mongoose');
require('dotenv').config();

// Cache the database connection
let cachedDb = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Import the db-config
const path = require('path');
const dbConfigPath = path.resolve(__dirname, '../../../scripts/db-config.js');
let dbConfig;
try {
  dbConfig = require(dbConfigPath);
} catch (error) {
  console.error('Error loading db-config.js:', error.message);
  dbConfig = { MONGODB_URI: null, useMockData: false };
}

// MongoDB Atlas connection string (hardcoded as primary connection)
const MONGODB_ATLAS_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';

// ALWAYS use the Atlas URI directly to avoid connection issues
const directMongoUri = MONGODB_ATLAS_URI;
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Debug information
console.log('MongoDB Connection Utility Initialized');
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('MongoDB URI source:', process.env.MONGODB_URI ? 'environment' : 
                              (dbConfig.MONGODB_URI ? 'db-config.js' : 'hardcoded fallback'));
console.log('Development mode:', isDevelopment ? 'yes' : 'no');
console.log('Debug DB connection:', process.env.DEBUG_DB_CONNECTION === 'true' ? 'yes' : 'no');
console.log('Development fallback disabled:', process.env.DISABLE_DEV_FALLBACK === 'true' ? 'yes' : 'no');

// Print the actual MongoDB URI if debug is enabled
if (process.env.DEBUG_DB_CONNECTION === 'true') {
  console.log('Actual MongoDB URI:', directMongoUri);
}

// Validate MongoDB URI format
function validateMongoDBUri(uri) {
  if (!uri) return 'MongoDB URI is not defined';
  
  // Basic format validation - more flexible to allow query parameters
  const validFormat = /^mongodb(\+srv)?:\/\/.+:.+@.+\/.+/;
  if (!validFormat.test(uri)) {
    return 'MongoDB URI format is invalid. Expected format: mongodb(+srv)://username:password@host/database';
  }
  
  return null; // No error
}

// Mock database connection for development without MongoDB
const mockDb = {
  connection: {
    readyState: 1,
    db: {
      listCollections: () => ({
        toArray: async () => []
      }),
      collection: (name) => ({
        find: () => ({
          limit: () => ({
            toArray: async () => []
          })
        }),
        findOne: async () => null,
        insertOne: async (doc) => ({ insertedId: 'mock-id', ...doc }),
        updateOne: async () => ({ modifiedCount: 1 }),
        deleteOne: async () => ({ deletedCount: 1 })
      })
    },
    on: () => {}
  }
};

async function connectToDatabase() {
  // If we're in development mode and using mock data, return the mock database
  if (dbConfig.useMockData) {
    console.log('Using mock database for development (forced by useMockData)');
    return mockDb;
  }
  
  // If we already have a connection, use it
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return cachedDb;
  }

  // Always use the Atlas URI directly
  const connectionUri = MONGODB_ATLAS_URI;
  console.log('Connecting with Atlas URI:', connectionUri ? connectionUri.substring(0, 20) + '...' : 'undefined');
  console.log('IMPORTANT: Always using direct Atlas connection, bypassing all other connection options');
  
  const uriError = validateMongoDBUri(connectionUri);
  if (uriError) {
    console.error('MongoDB URI validation error:', uriError);
    throw new Error(`MongoDB URI validation error: ${uriError}`);
  }
  
  // Connect with the Atlas URI
  return connectWithUri(connectionUri);
}

/**
 * Helper function to connect to MongoDB with the provided URI
 */
async function connectWithUri(uri) {
  // Configure connection options with proper pooling
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Adjust based on expected concurrent requests
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip trying IPv6
  };

  try {
    console.log('Connecting to MongoDB...');
    connectionAttempts++;
    
    // Print detailed connection information if debug is enabled
    if (process.env.DEBUG_DB_CONNECTION === 'true') {
      console.log('Connection attempt details:', {
        uri: uri.replace(/:\/\/(.*):(.*)@/, '://***:***@'),
        options,
        attempt: connectionAttempts,
        maxAttempts: MAX_CONNECTION_ATTEMPTS
      });
    }
    
    const client = await mongoose.connect(uri, options);
    console.log('MongoDB connection established');
    
    // Print connection details if debug is enabled
    if (process.env.DEBUG_DB_CONNECTION === 'true') {
      console.log('Connection details:', {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port
      });
    }
    
    // Cache the database connection
    cachedDb = mongoose;
    
    // Reset connection attempts on successful connection
    connectionAttempts = 0;
    
    // Set up error handling for the connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error event:', err);
      if (process.env.DEBUG_DB_CONNECTION === 'true') {
        console.error('Detailed connection error:', {
          name: err.name,
          message: err.message,
          code: err.code,
          codeName: err.codeName
        });
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected event fired');
      cachedDb = null; // Clear the cached connection
    });
    
    console.log('Connected to MongoDB successfully');
    return cachedDb;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    
    // Provide detailed error diagnostics
    let errorType = 'Unknown';
    if (error.name === 'MongoServerSelectionError') {
      errorType = 'Server Selection Error';
      console.error('Could not select a MongoDB server. Check if your IP is whitelisted in MongoDB Atlas.'); 
    } else if (error.name === 'MongoNetworkError') {
      errorType = 'Network Error';
      console.error('Network error. Check your internet connection and MongoDB URI.'); 
    } else if (error.message && error.message.includes('Authentication failed')) {
      errorType = 'Authentication Error';
      console.error('Authentication failed. Check your username and password in the MongoDB URI.');
    }
    
    console.error(`MongoDB ${errorType} (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
    
    // If we haven't reached the maximum number of attempts, try again
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`Retrying connection (attempt ${connectionAttempts + 1}/${MAX_CONNECTION_ATTEMPTS})...`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return connectToDatabase(); // Recursive retry
    }
    
    // Fall back to mock database in development mode
    if (isDevelopment) {
      console.warn('MongoDB connection failed after multiple attempts. Falling back to mock database in development mode.');
      return mockDb;
    }
    
    // In production, throw a detailed error
    cachedDb = null;
    throw new Error(`Failed to connect to MongoDB (${errorType}): ${error.message}`);
  }
}

module.exports = { connectToDatabase };
