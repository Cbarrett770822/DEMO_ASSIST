const mongoose = require('mongoose');

// Use the MongoDB Atlas connection string directly
// Based on the error message, we need to use the correct hostname format
const uri = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

async function testConnection() {
  console.log('Testing direct MongoDB connection...');
  
  try {
    // Set mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB with URI:', uri.replace(/:\/\/(.*):(.*)@/, '://***:***@'));
    const connection = await mongoose.connect(uri, options);
    
    console.log('Connection successful!');
    console.log('Connection details:');
    console.log('- Connection state:', mongoose.connection.readyState);
    console.log('- Database name:', mongoose.connection.name);
    console.log('- Host:', mongoose.connection.host);
    
    // Try to create a test collection
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Create a test document
    const testDoc = new Test({ name: 'test-connection' });
    await testDoc.save();
    console.log('Successfully created test document!');
    
    // Find the test document
    const foundDoc = await Test.findOne({ name: 'test-connection' });
    console.log('Found test document:', foundDoc);
    
    // Clean up - delete the test document
    await Test.deleteOne({ name: 'test-connection' });
    console.log('Deleted test document');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('Test completed with result:', success ? 'SUCCESS' : 'FAILURE');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  });
