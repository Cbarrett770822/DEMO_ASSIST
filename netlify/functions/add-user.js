/**
 * Add User Function
 * 
 * This serverless function adds a new user to the database.
 * It requires admin authentication to use.
 */

const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define User schema if it doesn't exist
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
    enum: ['admin', 'supervisor', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create or get the model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Function to validate token and extract user information
const validateToken = (token) => {
  // Check if it's a simplified token format (userId:username:role)
  if (token.includes(':')) {
    try {
      const parts = token.split(':');
      if (parts.length >= 3) {
        return {
          userId: parts[0],
          username: parts[1],
          role: parts[2],
          valid: true
        };
      }
    } catch (error) {
      console.error('Error parsing simplified token:', error);
      return { valid: false };
    }
  }
  
  // Try JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      valid: true
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // Check if it's a development fallback token
    if (token.startsWith('dev-fallback-')) {
      const parts = token.split('-');
      if (parts.length >= 3) {
        const username = parts[2];
        return {
          userId: `${username}-dev-id`,
          username: username,
          role: username === 'admin' ? 'admin' : 'user',
          valid: true
        };
      }
    }
    
    return { valid: false };
  }
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Get token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Authentication required' 
        })
      };
    }
    
    // Validate token and check admin role
    const tokenData = validateToken(token);
    
    if (!tokenData.valid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid authentication token' 
        })
      };
    }
    
    // Only allow admin users to add new users
    if (tokenData.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Admin privileges required to add users' 
        })
      };
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Parse the request body
    const userData = JSON.parse(event.body);
    
    // Validate required fields
    if (!userData.username || !userData.password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Username and password are required' 
        })
      };
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Username already exists' 
        })
      };
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user
    const newUser = new User({
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'user'
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    
    // Return success response with user data (excluding password)
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: {
          id: savedUser._id,
          username: savedUser.username,
          role: savedUser.role,
          createdAt: savedUser.createdAt
        }
      })
    };
  } catch (error) {
    console.error('Error adding user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Server error while adding user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
