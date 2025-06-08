// MongoDB connection test script
require('dotenv').config();
const mongoose = require('mongoose');

// Get connection string from db-config
const { MONGODB_URI } = require('./db-config');

// Direct MongoDB Atlas connection string
const DIRECT_MONGODB_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';

console.log('MongoDB Connection Test');
console.log('======================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI available:', !!MONGODB_URI);

// Don't log the full URI as it may contain credentials
if (MONGODB_URI) {
  const sanitizedUri = MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://***:***@');
  console.log('Connection string format:', sanitizedUri);
}

async function testConnection() {
  console.log('\nAttempting to connect to MongoDB...');
  
  // First try with direct connection string
  console.log('Testing with direct connection string...');
  
  try {
    // Set mongoose options for better stability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB using direct connection string
    await mongoose.connect(DIRECT_MONGODB_URI, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in database (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    
    // Provide more helpful error message based on the error
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not select a MongoDB server. Check if your IP is whitelisted in MongoDB Atlas.'); 
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Check your internet connection and MongoDB URI.'); 
    } else if (error.message && error.message.includes('Authentication failed')) {
      console.error('Authentication failed. Check your username and password in the MongoDB URI.');
    } else {
      console.error(error.message);
    }
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\nTest completed.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
