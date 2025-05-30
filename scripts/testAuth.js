// Script to test MongoDB connection and user authentication
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection string
const uri = process.env.MONGODB_URI;

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define User schema
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

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

async function testAuthentication() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');

    // Create User model
    const User = mongoose.model('User', UserSchema);

    // Test 1: Get all users
    console.log('\n--- Test 1: Get all users ---');
    const users = await User.find().select('-password');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });

    // Test 2: Authenticate admin user
    console.log('\n--- Test 2: Authenticate admin user ---');
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found');
    } else {
      const isValidPassword = await adminUser.comparePassword('admin123');
      console.log(`Admin authentication ${isValidPassword ? 'successful' : 'failed'}`);
      
      if (isValidPassword) {
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: adminUser._id,
            username: adminUser.username,
            role: adminUser.role
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        console.log('Generated JWT token for admin:');
        console.log(token);
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:');
        console.log(decoded);
      }
    }

    // Test 3: Authenticate regular user
    console.log('\n--- Test 3: Authenticate regular user ---');
    const regularUser = await User.findOne({ username: 'user' });
    if (!regularUser) {
      console.log('Regular user not found');
    } else {
      const isValidPassword = await regularUser.comparePassword('user123');
      console.log(`Regular user authentication ${isValidPassword ? 'successful' : 'failed'}`);
    }

    console.log('\nAll tests completed successfully');
  } catch (error) {
    console.error('Error during authentication test:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testAuthentication();
