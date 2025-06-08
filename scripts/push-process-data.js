// Script to push process data to MongoDB
const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('./db-config');
const fs = require('fs');
const path = require('path');

// Read and parse the process data file manually
const processDataPath = path.join(__dirname, '../src/features/processes/data/processData.js');
const processDataContent = fs.readFileSync(processDataPath, 'utf8');

// Extract the process data array using a regex pattern
// This extracts the array definition between const processData = [ ... ];
const processDataMatch = processDataContent.match(/const\s+processData\s*=\s*(\[[\s\S]*?\n\];)/);
if (!processDataMatch) {
  throw new Error('Could not parse process data from file');
}

// Evaluate the extracted JavaScript code to get the actual array
// This is a safe way to evaluate the specific code we need
const processDataCode = processDataMatch[1];
let processData;
eval('processData = ' + processDataCode);

async function pushProcessData() {
  console.log('Starting to push process data to MongoDB...');
  console.log(`Found ${processData.length} processes to upload`);
  
  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get reference to the database and collection
    const database = client.db('test');
    const collection = database.collection('processes');
    
    // Check if data already exists
    const existingCount = await collection.countDocuments();
    console.log(`Found ${existingCount} existing process records in database`);
    
    // Delete existing data if it exists
    if (existingCount > 0) {
      console.log('Clearing existing process data...');
      await collection.deleteMany({});
      console.log('Existing data cleared');
    }
    
    // Insert the process data
    console.log('Inserting process data...');
    const result = await collection.insertMany(processData);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} process documents`);
    
    // Verify data was inserted
    const newCount = await collection.countDocuments();
    console.log(`Database now contains ${newCount} process records`);
    
    // Log some sample data for verification
    console.log('\nSample data from database:');
    const samples = await collection.find().limit(2).toArray();
    samples.forEach((sample, index) => {
      console.log(`\nProcess ${index + 1}: ${sample.title}`);
      console.log(`ID: ${sample.id}`);
      console.log(`Category: ${sample.category}`);
      console.log(`Steps: ${sample.steps.length}`);
    });
    
    console.log('\n✅ Process data upload complete!');
    
  } catch (error) {
    console.error('❌ Error pushing process data:');
    console.error(error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the upload
pushProcessData()
  .then(() => {
    console.log('Script completed');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
