const { connectToDatabase } = require('./utils/mongodb');
const User = require('./models/User');
const mongoose = require('mongoose');

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const disableDevFallback = process.env.DISABLE_DEV_FALLBACK === 'true';

// For debugging
console.log('Login function initialized');
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('MongoDB URI available:', !!MONGODB_URI);
console.log('Development mode:', isDevelopment ? 'yes' : 'no');
console.log('Development fallback disabled:', process.env.DISABLE_DEV_FALLBACK === 'true' ? 'yes' : 'no');
console.log('Debug DB connection:', process.env.DEBUG_DB_CONNECTION === 'true' ? 'yes' : 'no');

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
        body: JSON.stringify({ 
          success: false, 
          message: 'Username and password are required' 
        })
      };
    }
    
    // Log the login attempt for debugging
    console.log(`Login attempt for user: ${username}`);
    
    // Development fallback for admin user when database connection fails
    let user;
    let dbConnectionFailed = false;
    
    try {
      // Connect to the database
      console.log('Attempting to connect to MongoDB...');
      const db = await connectToDatabase();
      console.log('MongoDB connection successful:', !!db);
      
      // Check if we're connected to a real database or mock database
      const isMockDb = db && db.connection && db.connection.readyState === 1 && !db.connection.db.databaseName;
      console.log('Using mock database:', isMockDb ? 'yes' : 'no');
      
      // Find user by username
      console.log('Searching for user:', username);
      user = await User.findOne({ username });
      console.log('User found:', !!user);
      
      // If no user found and this is the first login, create default users
      if (!user && isDevelopment && ['admin', 'user', 'supervisor'].includes(username) && password === 'password') {
        console.log(`User ${username} not found, creating default user...`);
        try {
          // Create default user
          const defaultRole = username === 'admin' ? 'admin' : (username === 'supervisor' ? 'supervisor' : 'user');
          const newUser = new User({
            username,
            password, // Will be hashed by the pre-save hook
            role: defaultRole
          });
          
          user = await newUser.save();
          console.log(`Created default ${defaultRole} user:`, username);
        } catch (createError) {
          console.error('Error creating default user:', createError);
          // Create a fallback user object since we couldn't save to the database
          user = {
            _id: `${username}-dev-id`,
            username: username,
            role: username === 'admin' ? 'admin' : (username === 'supervisor' ? 'supervisor' : 'user'),
            comparePassword: async (pwd) => pwd === 'password'
          };
          console.log('Using in-memory fallback user:', username);
        }
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      dbConnectionFailed = true;
      
      // In development, allow any default user to login with default password (unless disabled)
      // disableDevFallback is already defined at the top of the file
      console.log('Using disableDevFallback value in DB error handler:', disableDevFallback);
      
      if (isDevelopment && !disableDevFallback && password === 'password') {
        // Check if username matches any of our default users
        const defaultUsers = ['admin', 'user', 'supervisor'];
        const defaultRoles = {'admin': 'admin', 'user': 'user', 'supervisor': 'supervisor'};
        console.log('Development mode enabled, checking for default users...');
        
        if (defaultUsers.includes(username)) {
          console.log(`Using development fallback for ${username} authentication`);
          user = {
            _id: `${username}-dev-id`,
            username: username,
            role: defaultRoles[username] || 'user',
            comparePassword: async (pwd) => pwd === 'password'
          };
        } else {
          throw dbError; // Re-throw for non-default users
        }
      } else {
        // Log detailed error information if debug is enabled
        if (process.env.DEBUG_DB_CONNECTION === 'true') {
          console.error('Detailed database error:', {
            name: dbError.name,
            message: dbError.message,
            stack: dbError.stack,
            code: dbError.code,
            codeName: dbError.codeName
          });
        }
        throw dbError; // Re-throw for production or when fallback is disabled
      }
    }
    
    // If no user found and not using fallback
    if (!user && !dbConnectionFailed) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid credentials' 
        })
      };
    }
    
    // Check password (skip if using fallback)
    let isPasswordValid = false;
    
    // For development fallback with default users
    const defaultUsers = ['admin', 'user', 'supervisor'];
    
    console.log('Password validation check:');
    console.log('- Development mode:', isDevelopment ? 'yes' : 'no');
    console.log('- Database connection failed:', dbConnectionFailed ? 'yes' : 'no');
    console.log('- Username in default users:', defaultUsers.includes(username) ? 'yes' : 'no');
    console.log('- Password is "password":', password === 'password' ? 'yes' : 'no');
    
    // In development mode, allow default users to login with default password (unless disabled)
    // disableDevFallback is already defined at the top of the file
    console.log('DISABLE_DEV_FALLBACK environment variable:', process.env.DISABLE_DEV_FALLBACK);
    console.log('disableDevFallback parsed value:', disableDevFallback);

    // Force using database authentication when fallback is disabled
    if (isDevelopment && !disableDevFallback && defaultUsers.includes(username) && password === 'password') {
      console.log(`Using development mode password check for ${username}`);
      isPasswordValid = true;
    } else {
      console.log('Using actual database authentication for', username);
      // Do not set isPasswordValid here - let it go through the database check
    }

    if (user && typeof user.comparePassword === 'function') {
      try {
        console.log('Attempting to validate password with comparePassword method...');
        isPasswordValid = await user.comparePassword(password);
        console.log('Password validation result:', isPasswordValid ? 'valid' : 'invalid');
      } catch (pwdError) {
        console.error('Error comparing password:', pwdError);
        isPasswordValid = false;
      }
    } else {
      console.error('User object does not have comparePassword method');
      isPasswordValid = false;
    }
    
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid credentials' 
        })
      };
    }
    
    // Ensure user has a role, defaulting to 'user' if not set
    const userRole = user.role || 'user';
    
    // For admin users, always ensure role is explicitly set to 'admin'
    const finalRole = username === 'admin' ? 'admin' : userRole;
    
    // Create a simple identifier instead of a JWT token
    const userId = user._id ? (user._id.toString ? user._id.toString() : user._id) : `${username}-dev-id`;
    
    // Format: userId:username:role
    const token = `${userId}:${user.username}:${finalRole}`;
    
    // Create a consistent user object for the response
    const userResponse = {
      id: userId,
      username: user.username,
      role: finalRole
    };
    
    console.log('Login successful for user:', userResponse);
    
    // Return success response with token and user info
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      })
    };
  } catch (error) {
    console.error('Error logging in:', error);
    
    // Determine the appropriate error message and status code
    let statusCode = 500;
    let errorMessage = 'Failed to login. Server error occurred.';
    
    // Handle specific error types
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Invalid request format. Please provide valid JSON.';
    } else if (error.name === 'MongoServerSelectionError') {
      errorMessage = 'Database connection error. Please try again later.';
    } else if (error.name === 'MongoNetworkError') {
      errorMessage = 'Network error connecting to database. Please try again later.';
    }
    
    // Development mode: provide more detailed error information
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDevelopment) {
      console.log('Development mode: Providing detailed error information');
      return {
        statusCode: statusCode,
        body: JSON.stringify({ 
          success: false, 
          message: errorMessage,
          error: error.message,
          stack: error.stack,
          name: error.name
        })
      };
    }
    
    // Production mode: limited error information
    return {
      statusCode: statusCode,
      body: JSON.stringify({ 
        success: false, 
        message: errorMessage
      })
    };
  }
};
