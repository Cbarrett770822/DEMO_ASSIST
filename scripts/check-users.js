/**
 * Script to check MongoDB for users and their roles
 * 
 * This script connects to the MongoDB database and retrieves all users and their roles.
 */

// Import the MongoDB connection utility and User model
const { connectToDatabase } = require('../netlify/functions/utils/mongodb');
const User = require('../netlify/functions/models/User');
const mongoose = require('mongoose');

// Self-executing async function
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    const { dbError } = await connectToDatabase();
    
    if (dbError) {
      console.error('Failed to connect to database:', dbError.message);
      process.exit(1);
    }
    
    console.log('Connected to MongoDB successfully');
    
    // Find all users using the User model
    const users = await User.find({});
    
    console.log('\n===== USERS IN DATABASE =====');
    console.log(`Total users: ${users.length}`);
    console.log('----------------------------');
    
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      // Display user information
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Password: ${user.password || 'N/A'} ${user.password ? '(hashed)' : ''}`);
        console.log(`  Email: ${user.email || 'N/A'}`);
        console.log(`  Role: ${user.role || 'user'}`);
        console.log(`  Created At: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
        console.log('----------------------------');
      });
      
      // Count users by role
      const roleCount = users.reduce((acc, user) => {
        const role = user.role || 'user';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n===== ROLE SUMMARY =====');
      Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`${role}: ${count} user(s)`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the MongoDB connection
    console.log('Closing MongoDB connection...');
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
