/**
 * Create Admin User in MongoDB
 * 
 * This script creates an admin user in the MongoDB database
 * with the default password.
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const uri = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

// Admin user details
const adminUser = {
  username: 'admin',
  password: 'password', // This will be hashed before storing
  role: 'admin',
  name: 'Administrator',
  email: 'admin@example.com',
  createdDate: new Date(),
  isActive: true
};

async function createAdminUser() {
  let client;
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get the database and users collection
    const db = client.db('test');
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingUser = await usersCollection.findOne({ username: adminUser.username });
    
    if (existingUser) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Update the admin user
      const result = await usersCollection.updateOne(
        { username: adminUser.username },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            lastUpdated: new Date()
          } 
        }
      );
      
      console.log(`Admin user updated: ${result.modifiedCount > 0 ? 'Success' : 'No changes needed'}`);
    } else {
      console.log('Admin user does not exist. Creating new admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Create the admin user with hashed password
      const userToInsert = {
        ...adminUser,
        password: hashedPassword
      };
      
      const result = await usersCollection.insertOne(userToInsert);
      console.log(`Admin user created with ID: ${result.insertedId}`);
    }
    
    // Verify the admin user
    const verifyUser = await usersCollection.findOne({ username: adminUser.username });
    console.log('Admin user verification:');
    console.log({
      username: verifyUser.username,
      role: verifyUser.role,
      exists: !!verifyUser,
      passwordHashed: verifyUser.password !== adminUser.password
    });
    
    console.log('Admin user setup complete');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
createAdminUser();
