/**
 * Test function for token parsing
 * 
 * This function helps diagnose token parsing issues by returning detailed information
 * about how the token is being processed. It mimics the exact token parsing logic used
 * in the get-user-settings.js and save-user-settings.js functions.
 */

exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  try {
    // Get authorization header
    const authHeader = event.headers.authorization || '';
    console.log('Raw Authorization header:', authHeader);
    
    // Parse token information
    const result = {
      authHeader: authHeader,
      hasBearerPrefix: authHeader.startsWith('Bearer '),
      rawToken: null,
      tokenParts: [],
      isSimplifiedFormat: false,
      parsedToken: {
        userId: null,
        username: null,
        role: null
      }
    };
    
    // Extract token - use the exact same logic as in get-user-settings.js
    if (authHeader.startsWith('Bearer ')) {
      result.rawToken = authHeader.substring(7).trim();
      console.log('Bearer prefix detected and removed');
    } else {
      result.rawToken = authHeader.trim();
      console.log('No Bearer prefix detected');
    }
    
    // Add trimmed token info
    result.trimmedToken = result.rawToken ? result.rawToken.trim() : null;
    result.tokenLength = result.trimmedToken ? result.trimmedToken.length : 0;
    
    // Check if it's our simplified token format (userId:username:role)
    if (result.rawToken && result.rawToken.includes(':')) {
      const parts = result.rawToken.split(':');
      result.tokenParts = parts;
      result.isSimplifiedFormat = parts.length >= 3;
      
      if (result.isSimplifiedFormat) {
        result.parsedToken = {
          userId: parts[0],
          username: parts[1],
          role: parts[2]
        };
      }
    }
    
    // Return detailed token information
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tokenInfo: result,
        requestHeaders: event.headers,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in test-token-parsing:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error processing token',
        message: error.message
      })
    };
  }
};
