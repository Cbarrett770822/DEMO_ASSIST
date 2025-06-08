/**
 * Token Utilities
 * 
 * This module provides utilities for working with authentication tokens,
 * supporting both simplified token format and JWT tokens.
 */

/**
 * Parse and validate a token
 * @param {string} token - The token to parse
 * @returns {Object|null} - Parsed token data or null if invalid
 */
export const parseToken = (token) => {
  if (!token) return null;
  
  try {
    // Check if it's our simplified token format (userId:username:role)
    if (token.includes(':')) {
      const parts = token.split(':');
      if (parts.length >= 3) {
        return {
          userId: parts[0],
          username: parts[1],
          role: parts[2],
          type: 'simplified'
        };
      }
    }
    
    // Check for JWT token format
    if (token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          userId: payload.userId || payload.sub,
          username: payload.username,
          role: payload.role,
          exp: payload.exp,
          type: 'jwt'
        };
      } catch (jwtError) {
        console.warn('Error parsing JWT payload:', jwtError);
        return null;
      }
    }
    
    // Check for development fallback tokens
    if (token.startsWith('dev-fallback-')) {
      const username = token.split('-')[2];
      return {
        userId: `${username}-dev-id`,
        username,
        role: username === 'admin' ? 'admin' : 'user',
        type: 'dev-fallback'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Get user ID from token
 * @param {string} token - The token
 * @returns {string|null} - User ID or null if invalid
 */
export const getUserIdFromToken = (token) => {
  const parsed = parseToken(token);
  return parsed ? parsed.userId : null;
};

/**
 * Generate a token
 * @param {Object} user - User object with id, username, and role
 * @returns {string} - Generated token
 */
export const generateToken = (user) => {
  return `${user.id || user._id}:${user.username}:${user.role || 'user'}`;
};

/**
 * Check if a token is valid
 * @param {string} token - The token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidToken = (token) => {
  return parseToken(token) !== null;
};

/**
 * Get user role from token
 * @param {string} token - The token
 * @returns {string|null} - User role or null if invalid
 */
export const getUserRoleFromToken = (token) => {
  const parsed = parseToken(token);
  return parsed ? parsed.role : null;
};
