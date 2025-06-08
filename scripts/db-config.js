// MongoDB configuration
require('dotenv').config();

// Get MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Atlas connection as primary connection
const atlasUri = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

// Always use Atlas URI, never fallback to localhost
const connectionUri = MONGODB_URI || atlasUri;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Force using real database when MONGODB_URI is provided
const forceMockData = process.env.FORCE_MOCK_DATA === 'true';

// Only use mock data if explicitly forced
const useMockData = forceMockData;

console.log('Using database connection URI:', connectionUri.replace(/:\/\/(.*):(.*)@/, '://***:***@'));
console.log('Development mode:', isDevelopment ? 'yes' : 'no');
console.log('Using mock data:', useMockData ? 'yes' : 'no');
console.log('Always connecting to online MongoDB database, never to localhost');

module.exports = {
  MONGODB_URI: connectionUri,
  useMockData
};
