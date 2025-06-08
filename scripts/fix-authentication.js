/**
 * Authentication Fix Script
 * 
 * This script will:
 * 1. Test MongoDB connection
 * 2. Check if users exist in the database
 * 3. Create default users if none exist
 * 4. Test authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

// Define User schema (matching the one used in the application)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'supervisor'], default: 'user' }
});

// Add password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create User model
const User = mongoose.model('User', userSchema);

// Default users to create if none exist
const defaultUsers = [
  { username: 'admin', password: 'password', role: 'admin' },
  { username: 'user', password: 'password', role: 'user' },
  { username: 'supervisor', password: 'password', role: 'supervisor' }
];

// Connect to MongoDB
async function connectToMongoDB() {
  console.log('Connecting to MongoDB...');
  console.log('URI:', MONGODB_URI.replace(/:\/\/(.*):(.*)@/, '://***:***@'));
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful!');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

// Check if users exist
async function checkUsers() {
  console.log('\nChecking for existing users...');
  
  try {
    const count = await User.countDocuments();
    console.log(`Found ${count} users in the database.`);
    
    if (count > 0) {
      const users = await User.find({}, { username: 1, role: 1 });
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
      });
    }
    
    return count;
  } catch (error) {
    console.error('Error checking users:', error.message);
    return 0;
  }
}

// Create default users
async function createDefaultUsers() {
  console.log('\nCreating default users...');
  
  try {
    const results = [];
    
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      
      if (existingUser) {
        console.log(`User ${userData.username} already exists.`);
        results.push({ username: userData.username, status: 'already exists' });
      } else {
        // Create new user
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Created user ${userData.username} with role ${userData.role}.`);
        results.push({ username: userData.username, status: 'created' });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error creating default users:', error.message);
    return [];
  }
}

// Test authentication
async function testAuthentication(username, password) {
  console.log(`\nTesting authentication for ${username}...`);
  
  try {
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User ${username} not found.`);
      return false;
    }
    
    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (isPasswordValid) {
      console.log('Authentication successful!');
      
      // Create token (same format as in the application)
      const userId = user._id.toString();
      const token = `${userId}:${user.username}:${user.role}`;
      
      console.log('User ID:', userId);
      console.log('Username:', user.username);
      console.log('Role:', user.role);
      console.log('Token:', token);
      
      return { success: true, user, token };
    } else {
      console.log('Invalid password.');
      return false;
    }
  } catch (error) {
    console.error('Error testing authentication:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== Authentication Fix Script ===');
  
  // Connect to MongoDB
  const isConnected = await connectToMongoDB();
  
  if (!isConnected) {
    console.error('Cannot proceed without MongoDB connection.');
    process.exit(1);
  }
  
  // Check if users exist
  const userCount = await checkUsers();
  
  // Create default users if none exist
  if (userCount === 0) {
    await createDefaultUsers();
  }
  
  // Test authentication for admin user
  const authResult = await testAuthentication('admin', 'password');
  
  if (authResult) {
    console.log('\nAuthentication system is working correctly!');
    console.log('\nTo authenticate in the application:');
    console.log('1. Username: admin');
    console.log('2. Password: password');
  } else {
    console.log('\nAuthentication system is not working correctly.');
    console.log('Please check the error messages above.');
  }
  
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('\nMongoDB connection closed.');
  console.log('=== Script completed ===');
}

// Run the script
main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
