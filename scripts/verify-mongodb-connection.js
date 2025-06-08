// Script to verify MongoDB connection and check the data

const mongoose = require('mongoose');

// Import the same db-config that worked in our previous test script
const { MONGODB_URI } = require('./db-config');

// Define database name
const MONGO_DATABASE = 'test';

// Log the connection string being used (with password masked)
console.log(`Using connection string: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);


async function verifyConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');

    // Get a list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nAvailable collections in ${MONGO_DATABASE} database:`);
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });

    // Check data in each collection
    console.log('\nData overview:');
    
    // Check processes collection
    if (collections.some(c => c.name === 'processes')) {
      const processes = await mongoose.connection.db.collection('processes').find({}).toArray();
      console.log(`Processes: ${processes.length} documents`);
      if (processes.length > 0) {
        console.log(`  Sample process: ${processes[0].title}`);
      }
    } else {
      console.log('Processes collection not found');
    }
    
    // Check presentations collection
    if (collections.some(c => c.name === 'presentations')) {
      const presentations = await mongoose.connection.db.collection('presentations').find({}).toArray();
      console.log(`Presentations: ${presentations.length} documents`);
      if (presentations.length > 0) {
        console.log(`  Sample presentation: ${presentations[0].title}`);
      }
    } else {
      console.log('Presentations collection not found');
    }
    
    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log(`Users: ${users.length} documents`);
      if (users.length > 0) {
        console.log(`  Sample user: ${users[0].username} (role: ${users[0].role})`);
      }
    } else {
      console.log('Users collection not found');
    }

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.error(error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

verifyConnection();
