const { connectToDatabase } = require('./utils/mongodb');
const Presentation = require('./models/Presentation');
const mongoose = require('mongoose');

// For simplified authentication
const isDevelopment = process.env.NODE_ENV === 'development';

exports.handler = async (event, context) => {
  // Set CORS headers for browser clients
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
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
  if (event.httpMethod !== 'POST') {
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
    
    // Check authentication for non-development environments
    if (!isDevelopment && !userId) {
      console.warn('No valid authentication provided in production environment');
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    } else if (isDevelopment && !userId) {
      console.log('Development mode: proceeding with fallback authentication');
      userId = 'dev-fallback-user';
      userRole = 'admin';
    }

    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    let presentations;
    let requestMetadata = {};
    
    try {
      const requestData = JSON.parse(event.body);
      
      // Handle both formats: array of presentations or {presentations, metadata} object
      if (Array.isArray(requestData)) {
        // Legacy format: direct array of presentations
        presentations = requestData;
        console.log('Received legacy format (direct array) for presentations');
      } else if (requestData && Array.isArray(requestData.presentations)) {
        // New format: {presentations, metadata} object
        presentations = requestData.presentations;
        requestMetadata = requestData.metadata || {};
        console.log('Received new format with metadata for presentations');
      } else {
        throw new Error('Presentations data must be an array or an object with a presentations array');
      }
      
      if (!Array.isArray(presentations)) {
        throw new Error('Presentations data must be an array');
      }
    } catch (parseError) {
      console.error('Error parsing presentations data:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid presentations data format',
          details: parseError.message 
        })
      };
    }
    
    // Extract metadata from request if available
    const metadataUserId = requestMetadata.userId || userId;
    const metadataUsername = requestMetadata.username || 'unknown';
    
    // Log the operation we're about to perform
    console.log(`Saving ${presentations.length} presentations to database for user ${metadataUserId} (${metadataUsername})`);
    
    try {
      // Add metadata to presentations
      const enhancedPresentations = presentations.map(presentation => ({
        ...presentation,
        updatedAt: new Date(),
        updatedBy: metadataUserId || userId || 'system',
        updatedByUsername: metadataUsername || 'unknown',
        timestamp: requestMetadata.timestamp || new Date().toISOString()
      }));
      
      // Use a session for atomic operations
      const session = await mongoose.startSession();
      let result;
      
      try {
        // Start a transaction
        session.startTransaction();
        
        // Process each presentation individually to update or insert
        const updateResults = [];
        
        for (const presentation of enhancedPresentations) {
          // Add userId to the presentation for user-specific filtering
          presentation.userId = metadataUserId || userId;
          
          // Try to find an existing presentation with the same id
          if (presentation.id) {
            const updateResult = await Presentation.findOneAndUpdate(
              { id: presentation.id },
              presentation,
              { upsert: true, new: true, session }
            );
            updateResults.push(updateResult);
            console.log(`Updated/inserted presentation with id: ${presentation.id}`);
          } else {
            // If no id is provided, create a new one
            const newPresentation = new Presentation(presentation);
            await newPresentation.save({ session });
            updateResults.push(newPresentation);
            console.log('Created new presentation without id');
          }
        }
        
        console.log(`Updated/inserted ${updateResults.length} presentations`);
        
        // Commit the transaction
        await session.commitTransaction();
        console.log('Transaction committed successfully');
      } catch (transactionError) {
        // If an error occurred, abort the transaction
        await session.abortTransaction();
        console.error('Transaction aborted due to error:', transactionError);
        throw transactionError; // Re-throw to be caught by the outer try-catch
      } finally {
        // End the session
        session.endSession();
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Presentations saved successfully',
          count: presentations.length
        })
      };
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // In development, return more details about the error
      if (isDevelopment) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: `Database operation failed: ${dbError.message}`,
            stack: dbError.stack
          })
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Failed to save presentations to database'
          })
        };
      }
    }
  } catch (error) {
    console.error('Unexpected error in savePresentations function:', error);
    
    // In development, return more details about the error
    if (isDevelopment) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: `Unexpected error: ${error.message}`,
          stack: error.stack
        })
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'An unexpected error occurred'
        })
      };
    }
  }
};
