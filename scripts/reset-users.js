/**
 * Script to reset users in MongoDB
 * 
 * This script connects to the MongoDB database, clears all existing users,
 * and creates new default users including an admin user.
 */

// Import required modules
const { connectToDatabase } = require('../netlify/functions/utils/mongodb');
const User = require('../netlify/functions/models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Default users to create
const defaultUsers = [
  {
    username: 'admin',
    password: 'password',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'password',
    email: 'user@example.com',
    role: 'user'
  },
  {
    username: 'supervisor',
    password: 'password',
    email: 'supervisor@example.com',
    role: 'supervisor'
  }
];

// Self-executing async function
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    console.log('Connected to MongoDB successfully');
    
    // Delete all existing users
    console.log('Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} users from the database`);
    
    // Create new users
    console.log('\nCreating new default users...');
    
    for (const userData of defaultUsers) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create the user (omitting email since it's not in the User model)
      const newUser = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });
      
      // Save the user to the database
      await newUser.save();
      console.log(`Created user: ${userData.username} with role: ${userData.role}`);
    }
    
    console.log('\n===== USER RESET COMPLETE =====');
    console.log(`Created ${defaultUsers.length} new users`);
    console.log('\nDefault credentials:');
    defaultUsers.forEach(user => {
      console.log(`- ${user.username} / ${user.password} (role: ${user.role})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Close the MongoDB connection
    console.log('\nClosing MongoDB connection...');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
    // Exit the process
    process.exit(0);
  }
})();
