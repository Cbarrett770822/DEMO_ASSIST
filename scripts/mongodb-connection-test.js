// MongoDB Connection Test Script
const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('./db-config');

// Function to properly encode MongoDB URI components
function createEncodedMongoURI(username, password, cluster, database) {
  // URI encode the username and password to handle special characters
  const encodedUsername = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  
  return `mongodb+srv://${encodedUsername}:${encodedPassword}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`;
}

async function testConnection() {
  console.log('Starting MongoDB connection test...');
  
  // Get the credentials from db-config.js (these are already loaded in the MONGODB_URI)
  console.log(`Using connection string: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
  
  // Create a properly encoded connection string as a fallback
  const MONGO_USERNAME = 'Charlesbtt7722@gmail.com';
  const MONGO_PASSWORD = '!Aleconfig770822!';
  const MONGO_CLUSTER = 'Cluster0';
  const MONGO_DATABASE = 'test';
  
  const encodedURI = createEncodedMongoURI(
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    MONGO_DATABASE
  );
  
  console.log(`Encoded URI (fallback): ${encodedURI.replace(/:[^:]*@/, ':****@')}`);
  
  // Try both URIs
  const urisToTry = [
    { name: 'Original URI', uri: MONGODB_URI },
    { name: 'Encoded URI', uri: encodedURI }
  ];
  
  for (const { name, uri } of urisToTry) {
    console.log(`\nTrying connection with ${name}...`);
    const client = new MongoClient(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      // Set timeout to 5 seconds to fail faster if connection isn't working
      serverSelectionTimeoutMS: 5000
    });
    
    try {
      // Connect to the MongoDB server
      await client.connect();
      console.log(`✅ Successfully connected to MongoDB using ${name}`);
      
      // List databases to confirm connection is working
      const adminDb = client.db('admin');
      const dbs = await adminDb.admin().listDatabases();
      console.log('\nAvailable databases:');
      dbs.databases.forEach(db => {
        console.log(`- ${db.name}`);
      });
      
      // Get the target database
      const database = client.db(MONGO_DATABASE);
      
      // List collections in the target database
      const collections = await database.listCollections().toArray();
      console.log(`\nCollections in '${MONGO_DATABASE}' database:`);
      if (collections.length === 0) {
        console.log('No collections found. This is normal for a new database.');
      } else {
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      }
      
      // Success! Connection is working
      console.log(`\n✅ MongoDB connection test PASSED using ${name}`);
      return true;
    } catch (error) {
      console.error(`❌ Connection failed using ${name}:`);
      console.error(`Error type: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      
      // Check for common error types and provide helpful messages
      if (error.name === 'MongoServerSelectionError') {
        if (error.message.includes('getaddrinfo ENOTFOUND')) {
          console.error('This typically means the cluster name is incorrect or DNS resolution failed.');
        } else if (error.message.includes('connection timed out')) {
          console.error('This typically means network connectivity issues or firewall blocking the connection.');
        }
      } else if (error.name === 'MongoError' && error.message.includes('Authentication failed')) {
        console.error('This typically means username or password is incorrect.');
      }
      
      // Continue to try the next URI
    } finally {
      // Close the connection regardless of success or failure
      await client.close();
    }
  }
  
  // If we reach here, all connection attempts failed
  console.error('\n❌ All MongoDB connection attempts FAILED');
  console.log('\nTroubleshooting tips:');
  console.log('1. Verify your MongoDB Atlas cluster is active');
  console.log('2. Check that your IP address is whitelisted in MongoDB Atlas Network Access');
  console.log('3. Confirm your username and password are correct');
  console.log('4. Make sure your cluster name is correct (should include the full domain)');
  console.log('5. Check if your database name exists or can be created');
  
  return false;
}

// Run the test
testConnection()
  .then(() => {
    console.log('\nConnection test completed.');
  })
  .catch(error => {
    console.error('\nUnexpected error during connection test:', error);
  });
