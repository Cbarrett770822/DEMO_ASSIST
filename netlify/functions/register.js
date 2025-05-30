const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Parse the request body
    const { username, password, role } = JSON.parse(event.body);
    
    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username already exists' })
      };
    }
    
    // Create new user
    const newUser = new User({
      username,
      password,
      role: role || 'user' // Default to 'user' if role not specified
    });
    
    // Save user to database
    await newUser.save();
    
    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success response with token and user info (excluding password)
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role
        }
      })
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to register user' })
    };
  }
};
