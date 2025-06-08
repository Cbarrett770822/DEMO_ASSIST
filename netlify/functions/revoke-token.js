/**
 * Revoke Token Function
 * 
 * This serverless function revokes an authentication token by adding it to a blacklist.
 * This provides better security by explicitly invalidating tokens during logout.
 */

const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');

// Define the token blacklist schema if it doesn't exist
let TokenBlacklist;
if (!mongoose.models.TokenBlacklist) {
  const tokenBlacklistSchema = new mongoose.Schema({
    token: {
      type: String,
      required: true,
      unique: true
    },
    revokedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  });

  // Create TTL index to automatically remove expired tokens
  tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
  TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
} else {
  TokenBlacklist = mongoose.models.TokenBlacklist;
}

// Extract token from authorization header
const getTokenFromHeader = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

// Parse token to get expiration time
const getTokenExpiration = (token) => {
  try {
    // Check if it's a JWT token
    const parts = token.split('.');
    if (parts.length === 3) {
      // Parse JWT payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      if (payload.exp) {
        return new Date(payload.exp * 1000); // Convert from seconds to milliseconds
      }
    }
    
    // For simplified tokens, set expiration to 24 hours from now
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('Error parsing token expiration:', error);
    // Default expiration: 24 hours from now
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
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

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ 
        success: false, 
        error: 'Method Not Allowed' 
      }) 
    };
  }

  try {
    // Extract token from authorization header
    const token = getTokenFromHeader(event);
    if (!token) {
      return { 
        statusCode: 401, 
        headers, 
        body: JSON.stringify({ 
          success: false, 
          error: 'No token provided' 
        }) 
      };
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    // Get token expiration
    const expiresAt = getTokenExpiration(token);
    
    // Add token to blacklist
    await TokenBlacklist.findOneAndUpdate(
      { token },
      { 
        token, 
        revokedAt: new Date(), 
        expiresAt 
      },
      { upsert: true, new: true }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Token revoked successfully'
      })
    };
  } catch (error) {
    console.error('Error revoking token:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error revoking token',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    };
  }
};
