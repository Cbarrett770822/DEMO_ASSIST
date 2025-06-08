const { connectToDatabase } = require('./utils/mongodb');
const Process = require('./models/Process');

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
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  context.callbackWaitsForEmptyEventLoop = false;
  let userId = null;
  let userRole = null;

  try {
    // Get the authorization token from the request headers
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    // Process authentication
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      
      if (token) {
        // For our simplified token format: "userId:username:role"
        const parts = token.split(':');
        if (parts.length === 3) {
          userId = parts[0];
          const username = parts[1];
          userRole = parts[2];
          console.log(`Authenticated request from user: ${username} with role: ${userRole}`);
        } else {
          console.log('Invalid token format');
        }
      }
    }

    // Connect to the database
    await connectToDatabase();
    
    // Prepare query based on user context
    let query = {};
    
    // If authenticated, filter by userId or show global processes
    if (userId) {
      if (userRole === 'admin') {
        // Admins can see all processes
        console.log('Admin user: showing all processes');
      } else {
        // Regular users see their processes or global ones (no userId)
        console.log(`Filtering processes for user: ${userId}`);
        query = { $or: [{ userId: userId }, { userId: { $exists: false } }] };
      }
    }
    
    console.log('Database query:', JSON.stringify(query));
    
    // Get processes with query
    const processes = await Process.find(query).lean();
    console.log(`Found ${processes.length} processes in database`);
    
    // If no processes found, return empty array
    if (!processes || processes.length === 0) {
      console.log('No processes found in database, returning empty array');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          processes: [],
          source: 'database-empty',
          count: 0,
          message: 'No processes found in the database'
        })
      };
    }
    
    // Return processes
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        processes: processes,
        source: 'database',
        count: processes.length
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    
    // Return error message
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Database error while retrieving processes',
        message: error.message,
        details: isDevelopment ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    };
  }
};
