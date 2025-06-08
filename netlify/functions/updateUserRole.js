/**
 * Update User Role Function
 * 
 * This serverless function updates a user's role in the MongoDB database.
 * It requires authentication and can only be used by admins or to self-promote
 * during the initial setup process.
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../utils/db');
const { validateMongoDBUri } = require('../utils/validation');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

// Define User schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'supervisor', 'admin'],
    default: 'user'
  },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Create or get the User model
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', UserSchema);
}

exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Diagnostic information to return
  const diagnostics = {
    environment: {
      hasMongoDBUri: !!MONGODB_URI,
      hasJwtSecret: !!JWT_SECRET,
      mongoUriValid: validateMongoDBUri(MONGODB_URI) === null
    },
    authentication: {
      hasToken: false,
      tokenVerified: false,
      userId: null,
      userRole: null
    },
    database: {
      connected: false,
      connectionState: null,
      userFound: false,
      userUpdated: false
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Verify authentication
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Authentication required', 
          diagnostics 
        })
      };
    }

    // Extract and verify JWT token
    const token = authHeader.split(' ')[1];
    diagnostics.authentication.hasToken = !!token;
    
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      diagnostics.authentication.tokenVerified = true;
      diagnostics.authentication.userId = decodedToken.userId;
      diagnostics.authentication.userRole = decodedToken.role;
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: `Invalid token: ${error.message}`, 
          diagnostics 
        })
      };
    }

    // Get userId and role from query parameters or body
    const queryParams = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    
    const targetUserId = queryParams.userId || body.userId;
    const newRole = queryParams.role || body.role;

    // Validate parameters
    if (!targetUserId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing userId parameter', 
          diagnostics 
        })
      };
    }

    if (!newRole || !['user', 'supervisor', 'admin'].includes(newRole)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid role parameter. Must be one of: user, supervisor, admin', 
          diagnostics 
        })
      };
    }

    // Connect to database
    const db = await connectToDatabase();
    diagnostics.database.connected = !!db;
    diagnostics.database.connectionState = mongoose.connection.readyState;

    // Authorization check: Only admins can change roles, or users can self-promote during setup
    const requestingUserId = decodedToken.userId;
    const isAdmin = decodedToken.role === 'admin';
    const isSelfUpdate = requestingUserId === targetUserId;

    // Find the requesting user to verify their role
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Requesting user not found', 
          diagnostics 
        })
      };
    }

    // Special case: Allow self-promotion to admin if there are no admins in the system
    let allowSelfPromotion = false;
    if (isSelfUpdate && newRole === 'admin' && !isAdmin) {
      // Check if any admin users exist
      const adminCount = await User.countDocuments({ role: 'admin' });
      allowSelfPromotion = adminCount === 0;
    }

    // Enforce authorization
    if (!isAdmin && !allowSelfPromotion) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Only administrators can change user roles', 
          diagnostics 
        })
      };
    }

    // Find and update the target user
    const targetUser = await User.findById(targetUserId);
    diagnostics.database.userFound = !!targetUser;
    
    if (!targetUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Target user not found', 
          diagnostics 
        })
      };
    }

    // Update the user's role
    targetUser.role = newRole;
    await targetUser.save();
    diagnostics.database.userUpdated = true;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `User role updated to ${newRole}`,
        user: {
          id: targetUser._id,
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role,
          name: targetUser.name
        },
        diagnostics
      })
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Server error: ${error.message}`, 
        diagnostics 
      })
    };
  }
};
