// Script to push presentation data to MongoDB
const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('./db-config');

// Mock presentation data from apiService.js
const PRESENTATIONS = [
  {
    id: '1',
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3',
    viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    directUrl: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx'
  },
  {
    id: '2',
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3',
    viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    directUrl: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx'
  },
  {
    id: '3',
    title: 'Outbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/outbound-processes.pptx',
    description: 'Detailed overview of picking, packing, and shipping processes',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3',
    viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://wms-presentations.s3.amazonaws.com/outbound-processes.pptx',
    directUrl: 'https://wms-presentations.s3.amazonaws.com/outbound-processes.pptx'
  },
  {
    id: '4',
    title: 'Inventory Management',
    url: 'https://docs.google.com/presentation/d/1XYZ123456/edit?usp=sharing',
    description: 'Overview of inventory management techniques and best practices',
    isLocal: false,
    fileType: 'gslides',
    sourceType: 'gslides',
    viewerUrl: 'https://docs.google.com/presentation/d/1XYZ123456/embed',
    directUrl: 'https://docs.google.com/presentation/d/1XYZ123456/export/pptx'
  }
];

async function pushPresentationsData() {
  console.log('Starting to push presentations data to MongoDB...');
  console.log(`Found ${PRESENTATIONS.length} presentations to upload`);
  
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
    const collection = database.collection('presentations');
    
    // Check if data already exists
    const existingCount = await collection.countDocuments();
    console.log(`Found ${existingCount} existing presentation records in database`);
    
    // Delete existing data if it exists
    if (existingCount > 0) {
      console.log('Clearing existing presentation data...');
      await collection.deleteMany({});
      console.log('Existing data cleared');
    }
    
    // Insert the presentation data
    console.log('Inserting presentation data...');
    const result = await collection.insertMany(PRESENTATIONS);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} presentation documents`);
    
    // Verify data was inserted
    const newCount = await collection.countDocuments();
    console.log(`Database now contains ${newCount} presentation records`);
    
    // Log some sample data for verification
    console.log('\nSample data from database:');
    const samples = await collection.find().limit(2).toArray();
    samples.forEach((sample, index) => {
      console.log(`\nPresentation ${index + 1}: ${sample.title}`);
      console.log(`ID: ${sample.id}`);
      console.log(`Type: ${sample.fileType}`);
      console.log(`Source: ${sample.sourceType}`);
    });
    
    console.log('\n✅ Presentation data upload complete!');
    
  } catch (error) {
    console.error('❌ Error pushing presentation data:');
    console.error(error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the upload
pushPresentationsData()
  .then(() => {
    console.log('Script completed');
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
