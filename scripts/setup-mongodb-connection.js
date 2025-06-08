/**
 * MongoDB Connection Setup Script
 * 
 * This script sets up the MongoDB connection for the WMS Tutorial Application
 * and ensures that the application can connect to the database correctly.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Atlas connection string
const MONGODB_ATLAS_URI = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
};

async function testConnection() {
  console.log('\n=== MongoDB Connection Test ===');
  
  // Check environment variables
  console.log('\nEnvironment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'not set');
  
  // Try connecting with the Atlas URI
  console.log('\nTesting connection with MongoDB Atlas URI...');
  try {
    await mongoose.connect(MONGODB_ATLAS_URI, options);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in database (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:');
    console.error(error.message);
    return false;
  }
}

async function updateDbConfig() {
  console.log('\n=== Updating Database Configuration ===');
  
  // Path to db-config.js
  const dbConfigPath = path.join(__dirname, 'db-config.js');
  
  try {
    // Read the current db-config.js file
    const content = fs.readFileSync(dbConfigPath, 'utf8');
    
    // Check if we need to update the file
    if (content.includes('useMockData = isDevelopment && !MONGODB_URI')) {
      console.log('Updating db-config.js to prioritize MongoDB Atlas connection...');
      
      // Replace the useMockData line
      const updatedContent = content.replace(
        'const useMockData = isDevelopment && !MONGODB_URI;',
        '// Force using real database when MONGODB_URI is provided\n' +
        'const forceMockData = process.env.FORCE_MOCK_DATA === \'true\';\n\n' +
        '// Only use mock data if explicitly forced or if no MongoDB URI is provided\n' +
        'const useMockData = (isDevelopment && !MONGODB_URI) || forceMockData;'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(dbConfigPath, updatedContent, 'utf8');
      console.log('✅ db-config.js updated successfully!');
    } else {
      console.log('db-config.js already updated or has a different structure.');
    }
  } catch (error) {
    console.error('❌ Failed to update db-config.js:');
    console.error(error.message);
  }
}

async function checkDbStorageService() {
  console.log('\n=== Checking dbStorageService.js ===');
  
  // Path to dbStorageService.js
  const dbStorageServicePath = path.join(__dirname, '..', 'src', 'services', 'dbStorageService.js');
  
  try {
    // Check if the file exists
    if (fs.existsSync(dbStorageServicePath)) {
      console.log('dbStorageService.js exists, checking token handling...');
      
      // Read the file
      const content = fs.readFileSync(dbStorageServicePath, 'utf8');
      
      // Check if it handles simplified tokens correctly
      if (content.includes('token.includes(\':\')')
          && content.includes('parts = token.split(\':\')')
          && content.includes('Simplified token is valid')) {
        console.log('✅ dbStorageService.js correctly handles simplified tokens!');
      } else {
        console.log('⚠️ dbStorageService.js might not handle simplified tokens correctly.');
        console.log('Please check the file manually.');
      }
    } else {
      console.log('❌ dbStorageService.js not found at expected location.');
    }
  } catch (error) {
    console.error('❌ Failed to check dbStorageService.js:');
    console.error(error.message);
  }
}

async function main() {
  console.log('=== WMS Tutorial Application MongoDB Setup ===');
  
  // Test MongoDB connection
  const connectionSuccessful = await testConnection();
  
  // Update db-config.js if needed
  await updateDbConfig();
  
  // Check dbStorageService.js
  await checkDbStorageService();
  
  console.log('\n=== Setup Complete ===');
  if (connectionSuccessful) {
    console.log('MongoDB connection is working correctly!');
    console.log('You can now start the application with:');
    console.log('npm start');
  } else {
    console.log('⚠️ MongoDB connection failed. Please check your connection string and try again.');
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in setup script:', error);
  process.exit(1);
});
