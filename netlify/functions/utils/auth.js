const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authenticate a user from a request
 * @param {Object} event - Netlify function event object
 * @param {boolean} requireAdmin - Whether admin role is required
 * @returns {Object} Object containing user and error (if any)
 */
const authenticateUser = async (event, requireAdmin = false) => {
  try {
    // Get authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Authorization token required', statusCode: 401 };
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Try to verify token - support both JWT and base64 encoded tokens
    let decoded;
    
    try {
      // First try JWT verification
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('JWT token verified successfully');
    } catch (jwtError) {
      // If JWT verification fails, try base64 decoding (for dev mode)
      try {
        decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if token is expired
        if (decoded.exp < Date.now()) {
          return { error: 'Token expired', statusCode: 401 };
        }
        
        console.log('Base64 token decoded successfully');
      } catch (base64Error) {
        console.error('Token verification failed:', base64Error);
        return { error: 'Invalid token format', statusCode: 401 };
      }
    }
    
    // Check if admin required
    if (requireAdmin && decoded.role !== 'admin') {
      return { error: 'Admin access required', statusCode: 403 };
    }
    
    // Return user info from token
    return { 
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role
      },
      statusCode: 200
    };
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Check if token verification failed
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', statusCode: 401 };
    }
    
    // Check if token expired
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', statusCode: 401 };
    }
    
    return { error: 'Authentication failed', statusCode: 500 };
  }
};

module.exports = { authenticateUser };
