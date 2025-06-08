const { connectToDatabase } = require('./utils/mongodb');
const Process = require('./models/Process');
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
    let processes = [];
    try {
      const parsedBody = JSON.parse(event.body);
      // Handle both formats: direct array or {processes: [...]} object
      processes = Array.isArray(parsedBody) ? parsedBody : (parsedBody.processes || []);
      console.log(`Parsed ${processes.length} processes from request body`);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid request body format',
          details: isDevelopment ? parseError.message : undefined
        })
      };
    }
    
    // Add metadata to processes
    const enhancedProcesses = processes.map(process => ({
      ...process,
      userId: userId,
      updatedAt: new Date(),
      updatedBy: userId
    }));
    
    // Use a session for atomic operations
    const session = await mongoose.startSession();
    
    try {
      // Start a transaction
      session.startTransaction();
      
      // Process each process individually to update or insert
      const updateResults = [];
      
      for (const process of enhancedProcesses) {
        // Try to find an existing process with the same id
        if (process.id) {
          const updateResult = await Process.findOneAndUpdate(
            { id: process.id },
            process,
            { upsert: true, new: true, session }
          );
          updateResults.push(updateResult);
          console.log(`Updated/inserted process with id: ${process.id}`);
        } else {
          // If no id is provided, create a new one
          const newProcess = new Process(process);
          await newProcess.save({ session });
          updateResults.push(newProcess);
          console.log('Created new process without id');
        }
      }
      
      console.log(`Updated/inserted ${updateResults.length} processes`);
      
      // Commit the transaction
      await session.commitTransaction();
      console.log('Transaction committed successfully');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Processes saved successfully',
          count: updateResults.length
        })
      };
    } catch (dbError) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      console.error('Transaction aborted due to error:', dbError);
      throw dbError; // Re-throw to be caught by the outer try-catch
    } finally {
      // End the session
      session.endSession();
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: `Failed to save processes: ${error.message}`,
        details: isDevelopment ? error.stack : undefined
      })
    };
  }
};
