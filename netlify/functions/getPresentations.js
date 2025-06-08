const { connectToDatabase } = require('./utils/mongodb');
const Presentation = require('./models/Presentation');

// For simplified authentication
const isDevelopment = process.env.NODE_ENV === 'development';

exports.handler = async (event, context) => {
  // Set CORS headers for browser clients
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=300' // Cache for 5 minutes
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Method Not Allowed' 
      }) 
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const requestedUserId = queryParams.userId;
    
    // Optional authentication check - simplified for our token format
    let userId = null;
    let username = null;
    let userRole = null;
    
    if (event.headers && (event.headers.authorization || event.headers.Authorization)) {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      
      if (token) {
        // For our simplified token format: "userId:username:role"
        const parts = token.split(':');
        if (parts.length === 3) {
          userId = parts[0];
          username = parts[1];
          userRole = parts[2];
          console.log(`Authenticated request from user: ${username} with role: ${userRole}`);
        } else {
          console.log('Invalid token format, but proceeding for read-only operation');
        }
      }
    } else if (isDevelopment) {
      console.log('Development mode: proceeding without authentication for read-only operation');
      if (requestedUserId) {
        userId = requestedUserId;
        username = 'dev-user';
        userRole = 'admin';
      }
    }

    // Connect to the database
    await connectToDatabase();
    
    // Prepare query based on user context
    let query = {};
    
    // If specific user ID is requested and matches authenticated user or admin
    if (requestedUserId && (userRole === 'admin' || requestedUserId === userId)) {
      console.log(`Filtering presentations for requested user: ${requestedUserId}`);
      query.userId = requestedUserId;
    } else if (userId) {
      // If authenticated, show presentations for this user or those without a userId (global)
      console.log(`Filtering presentations for authenticated user: ${userId}`);
      query = { $or: [{ userId: userId }, { userId: { $exists: false } }] };
    }
    
    console.log('Database query:', JSON.stringify(query));
    
    // Get presentations with query
    let presentations = await Presentation.find(query).lean();
    console.log(`Found ${presentations.length} presentations in database`);
    
    // If no presentations are found, return an empty array
    if (!presentations || presentations.length === 0) {
      console.log('No presentations found in database, returning empty array');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          presentations: [],
          source: 'database-empty',
          count: 0,
          message: 'No presentations found in the database'
        })
      };
    }
    
    // Process presentations to add direct URLs and viewer URLs
    const processedPresentations = presentations.map(presentation => {
      // Create a temporary model instance to use the methods
      const tempModel = new Presentation(presentation);
      
      return {
        ...presentation,
        directUrl: tempModel.getDirectUrl ? tempModel.getDirectUrl() : presentation.url,
        viewerUrl: tempModel.getViewerUrl ? tempModel.getViewerUrl() : presentation.url
      };
    });
    
    // Return presentations
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        presentations: processedPresentations,
        source: 'database',
        count: processedPresentations.length
      })
    };
  } catch (error) {
    console.error('Error getting presentations:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    // Return a proper error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Database error while retrieving presentations',
        message: error.message,
        details: isDevelopment ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    };
  }
};
