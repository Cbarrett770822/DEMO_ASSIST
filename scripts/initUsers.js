// Script to initialize MongoDB database with default users
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const uri = process.env.MONGODB_URI;

// Define User schema for this script
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Default users
const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123', // This will be hashed before saving
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123', // This will be hashed before saving
    role: 'user'
  }
];

async function initializeUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create User model
    const User = mongoose.model('User', UserSchema);

    // Check if users collection exists and has data
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users. Skipping initialization.`);
      console.log('Existing usernames:');
      existingUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
      });
    } else {
      // Create default users with hashed passwords
      const usersToCreate = await Promise.all(defaultUsers.map(async user => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return {
          ...user,
          password: hashedPassword
        };
      }));
      
      // Insert users
      await User.insertMany(usersToCreate);
      console.log(`Created ${usersToCreate.length} default users:`);
      usersToCreate.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
      });
    }

    console.log('User initialization complete');
  } catch (error) {
    console.error('Error initializing users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeUsers();
