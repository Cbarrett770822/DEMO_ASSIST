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
    const { username, password } = JSON.parse(event.body);
    
    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success response with token and user info
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      })
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to login' })
    };
  }
};
