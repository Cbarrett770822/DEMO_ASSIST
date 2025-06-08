const { connectToDatabase } = require('./utils/mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.handler = async (event, context) => {
  // Log the incoming request for debugging
  console.log('Received request to view-db-data');
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Check for authorization token
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authorization token is missing or invalid');
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        error: 'Authorization token is missing or invalid',
        message: 'Please log in to access this resource'
      })
    };
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received, attempting to verify');
  
  try {
    // Verify token (this uses base64 decoding for the mock token)
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      console.log('Token decoded successfully', { userId: tokenData.userId, role: tokenData.role });
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
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
      console.log('Token expired');
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        })
      };
    }
    
    // Check if user has admin role
    if (tokenData.role !== 'admin') {
      console.log('User does not have admin role:', tokenData.role);
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: 'Admin access required',
          message: 'This operation requires administrator privileges'
        })
      };
    }
    
    console.log('Attempting to connect to MongoDB');
    // Connect to MongoDB
    let db;
    try {
      db = await connectToDatabase();
      console.log('MongoDB connection established');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Database connection failed',
          message: 'Unable to connect to the database. Please try again later.'
        })
      };
    }
    
    // Get all collections
    let collections;
    try {
      collections = await db.db.listCollections().toArray();
      console.log(`Found ${collections.length} collections`);
    } catch (collectionError) {
      console.error('Error listing collections:', collectionError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to list collections',
          message: 'Could not retrieve database collections'
        })
      };
    }
    
    // Collect data from each collection (limit to 10 documents per collection)
    const dbData = {};
    
    try {
      for (const collection of collections) {
        const collectionName = collection.name;
        const documents = await db.db.collection(collectionName).find({}).limit(10).toArray();
        dbData[collectionName] = documents;
        console.log(`Retrieved ${documents.length} documents from ${collectionName}`);
      }
    } catch (documentsError) {
      console.error('Error retrieving documents:', documentsError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to retrieve documents',
          message: 'Could not retrieve data from the database'
        })
      };
    }
    
    // Return database data
    console.log('Successfully retrieved all requested data');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Database data retrieved successfully',
        data: dbData
      })
    };
  } catch (error) {
    console.error('Unhandled error in view-db-data function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve database data' })
    };
  }
};
