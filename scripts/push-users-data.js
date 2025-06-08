// Script to push user data to MongoDB
const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('./db-config');
const bcrypt = require('bcryptjs');

// Default users to create in the database
const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin123', // Will be hashed before saving
    role: 'admin',
    createdAt: new Date()
  },
  {
    username: 'user',
    password: 'user123', // Will be hashed before saving
    role: 'user',
    createdAt: new Date()
  }
];

async function pushUsersData() {
  console.log('Starting to push users data to MongoDB...');
  console.log(`Found ${DEFAULT_USERS.length} users to upload`);
  
  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get reference to the database and collection
    const database = client.db('test');
    const collection = database.collection('users');
    
    // Check if data already exists
    const existingCount = await collection.countDocuments();
    console.log(`Found ${existingCount} existing user records in database`);
    
    // Delete existing data if it exists
    if (existingCount > 0) {
      console.log('Clearing existing user data...');
      await collection.deleteMany({});
      console.log('Existing data cleared');
    }
    
    // Hash passwords for all users
    console.log('Hashing user passwords...');
    const usersWithHashedPasswords = await Promise.all(DEFAULT_USERS.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      return {
        ...user,
        password: hashedPassword
      };
    }));
    
    // Insert the user data
    console.log('Inserting user data...');
    const result = await collection.insertMany(usersWithHashedPasswords);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} user documents`);
    
    // Verify data was inserted
    const newCount = await collection.countDocuments();
    console.log(`Database now contains ${newCount} user records`);
    
    // Log some sample data for verification (hide password hashes)
    console.log('\nSample data from database:');
    const samples = await collection.find().toArray();
    samples.forEach((sample, index) => {
      console.log(`\nUser ${index + 1}: ${sample.username}`);
      console.log(`Role: ${sample.role}`);
      console.log(`Created: ${sample.createdAt}`);
      console.log(`Password: (hashed)`);
    });
    
    console.log('\n✅ User data upload complete!');
    
  } catch (error) {
    console.error('❌ Error pushing user data:');
    console.error(error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the upload
pushUsersData()
  .then(() => {
    console.log('Script completed');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
