const mongoose = require('mongoose');
require('dotenv').config();

// Cache the database connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to the MongoDB database
  await mongoose.connect(process.env.MONGODB_URI);
  
  cachedDb = mongoose.connection;
  return cachedDb;
}

module.exports = { connectToDatabase };
