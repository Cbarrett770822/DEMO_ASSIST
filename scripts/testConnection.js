// Script to test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const uri = process.env.MONGODB_URI;

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get a list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\nDocument counts:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    // Sample data from presentations
    if (collections.some(c => c.name === 'presentations')) {
      console.log('\nSample presentation data:');
      const presentations = await mongoose.connection.db.collection('presentations').find({}).limit(2).toArray();
      console.log(JSON.stringify(presentations, null, 2));
    }
    
    // Sample data from processes
    if (collections.some(c => c.name === 'processes')) {
      console.log('\nSample process data:');
      const processes = await mongoose.connection.db.collection('processes').find({}).limit(1).toArray();
      console.log(JSON.stringify(processes, null, 2));
    }
    
    console.log('\n✅ MongoDB connection test complete!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testConnection();
