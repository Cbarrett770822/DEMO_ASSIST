const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define the Notes schema
const NotesSchema = new mongoose.Schema({
  userId: String,
  notes: Array,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check for authorization token
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: 'Authorization token is missing or invalid',
        message: 'Please log in to access this resource'
      })
    };
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (decodeError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Invalid token format',
          message: 'The authentication token is malformed'
        })
      };
    }
    
    // Check if token is expired
    if (tokenData.exp < Date.now()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        })
      };
    }
    
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Parse request body
    const { notes } = JSON.parse(event.body);
    const userId = tokenData.userId;
    
    if (!notes || !Array.isArray(notes)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid request body',
          message: 'Notes must be provided as an array'
        })
      };
    }
    
    // Create model
    const Notes = mongoose.models.Notes || mongoose.model('Notes', NotesSchema);
    
    // Update or create notes document
    const result = await Notes.findOneAndUpdate(
      { userId },
      { 
        userId,
        notes,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notes saved successfully',
        data: {
          userId,
          updatedAt: result.updatedAt
        }
      })
    };
  } catch (error) {
    console.error('Error saving notes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to save notes',
        message: error.message
      })
    };
  }
};
