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
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Get user ID from query parameters or use 'guest'
    const userId = event.queryStringParameters?.userId || 'guest';
    
    // Create model
    const Notes = mongoose.models.Notes || mongoose.model('Notes', NotesSchema);
    
    // Find notes for the user
    const userNotes = await Notes.findOne({ userId });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        notes: userNotes?.notes || [],
        message: 'Notes retrieved successfully'
      })
    };
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to retrieve notes',
        message: error.message
      })
    };
  }
};
