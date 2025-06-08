// Direct MongoDB test script for processes
require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./db-config');

// MongoDB connection string - use the one from environment or db-config
const connectionString = process.env.MONGODB_URI || MONGODB_URI;

// Process Schema definition (matching the one in our application)
const StepSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  videoUrl: String
});

const ProcessSchema = new mongoose.Schema({
  id: String,
  title: String,
  name: String,
  description: String,
  category: String,
  userId: String,
  updatedAt: Date,
  updatedBy: String,
  steps: [StepSchema]
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual getter that ensures title and name are synchronized
ProcessSchema.virtual('displayTitle').get(function() {
  return this.title || this.name;
});

// Middleware to ensure title and name are synchronized
ProcessSchema.pre('save', function(next) {
  if (this.title && !this.name) {
    this.name = this.title;
  } else if (this.name && !this.title) {
    this.title = this.name;
  }
  next();
});

// Create the Process model
const Process = mongoose.model('Process', ProcessSchema);

// Test process data
const testProcess = {
  id: 'test-process-1',
  title: 'Receiving Process (Updated)',
  name: 'Receiving Process (Updated)',
  description: 'Process for receiving goods at the warehouse',
  category: 'Inbound',
  userId: '64a65c1a9d7d3e6a0f9b0e01', // Admin user ID
  updatedAt: new Date(),
  updatedBy: '64a65c1a9d7d3e6a0f9b0e01',
  steps: [
    {
      id: '1',
      title: 'Truck Arrival',
      description: 'Truck arrives at the receiving dock',
      videoUrl: 'https://example.com/custom-video-url.mp4'
    },
    {
      id: '2',
      title: 'Unload Pallets',
      description: 'Unload pallets from the truck',
      videoUrl: 'https://example.com/custom-video-url2.mp4'
    }
  ]
};

// Updated process data
const updatedProcess = {
  ...testProcess,
  title: 'Receiving Process (Updated Again)',
  name: 'Receiving Process (Updated Again)',
  steps: [
    ...testProcess.steps,
    {
      id: '3',
      title: 'Scan Barcodes',
      description: 'Scan all incoming barcodes',
      videoUrl: 'https://example.com/custom-video-url3.mp4'
    }
  ]
};

// Connect to MongoDB and run tests
async function runTests() {
  console.log('Starting direct MongoDB process tests...\n');
  
  try {
    console.log('Connecting to MongoDB...');
    console.log('Connection string:', connectionString ? connectionString.substring(0, 20) + '...' : 'undefined');
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    console.log('Connected to MongoDB successfully!');
    
    // 1. Get current processes
    console.log('\n1. Getting current processes...');
    const initialProcesses = await Process.find({});
    console.log(`Initial processes count: ${initialProcesses.length}`);
    
    console.log('Current process titles:');
    initialProcesses.forEach(process => {
      console.log(`- ${process.title || process.name}`);
      console.log(`  Steps: ${process.steps ? process.steps.length : 0}`);
    });
    
    // 2. Save a new process
    console.log('\n2. Saving test process...');
    
    // Find if process already exists
    let existingProcess = await Process.findOne({ id: testProcess.id });
    
    if (existingProcess) {
      console.log('Process already exists, updating...');
      Object.assign(existingProcess, testProcess);
      await existingProcess.save();
    } else {
      console.log('Creating new process...');
      const newProcess = new Process(testProcess);
      await newProcess.save();
    }
    
    console.log('Process saved successfully!');
    
    // 3. Get the saved process
    console.log('\n3. Getting saved process...');
    const savedProcess = await Process.findOne({ id: testProcess.id });
    
    if (savedProcess) {
      console.log('Found saved process:');
      console.log(`- ID: ${savedProcess.id}`);
      console.log(`- Title: ${savedProcess.title}`);
      console.log(`- Name: ${savedProcess.name}`);
      console.log(`- Steps: ${savedProcess.steps.length}`);
      
      console.log('\nVerification:');
      console.log(`Expected title: ${testProcess.title}`);
      console.log(`Actual title: ${savedProcess.title}`);
      console.log(`Title saved correctly: ${savedProcess.title === testProcess.title ? 'YES ✓' : 'NO ✗'}`);
      
      console.log('\nSteps verification:');
      console.log(`Expected steps: ${testProcess.steps.length}`);
      console.log(`Actual steps: ${savedProcess.steps.length}`);
      
      if (savedProcess.steps && savedProcess.steps.length > 0) {
        console.log('Step details:');
        savedProcess.steps.forEach((step, index) => {
          console.log(`- Step ${index + 1}: ${step.title}`);
          console.log(`  Video URL: ${step.videoUrl}`);
        });
      }
    } else {
      console.log('Failed to find saved process!');
    }
    
    // 4. Update the process
    console.log('\n4. Updating process...');
    
    const updateResult = await Process.findOneAndUpdate(
      { id: updatedProcess.id },
      updatedProcess,
      { new: true }
    );
    
    console.log('Process updated successfully!');
    
    // 5. Get the updated process
    console.log('\n5. Getting updated process...');
    const updatedSavedProcess = await Process.findOne({ id: updatedProcess.id });
    
    if (updatedSavedProcess) {
      console.log('Found updated process:');
      console.log(`- ID: ${updatedSavedProcess.id}`);
      console.log(`- Title: ${updatedSavedProcess.title}`);
      console.log(`- Name: ${updatedSavedProcess.name}`);
      console.log(`- Steps: ${updatedSavedProcess.steps.length}`);
      
      console.log('\nFinal Verification:');
      console.log(`Expected title: ${updatedProcess.title}`);
      console.log(`Actual title: ${updatedSavedProcess.title}`);
      console.log(`Title updated correctly: ${updatedSavedProcess.title === updatedProcess.title ? 'YES ✓' : 'NO ✗'}`);
      
      console.log('\nSteps verification:');
      console.log(`Expected steps: ${updatedProcess.steps.length}`);
      console.log(`Actual steps: ${updatedSavedProcess.steps.length}`);
      console.log(`Steps count updated correctly: ${updatedSavedProcess.steps.length === updatedProcess.steps.length ? 'YES ✓' : 'NO ✗'}`);
      
      if (updatedSavedProcess.steps && updatedSavedProcess.steps.length > 0) {
        console.log('Updated step details:');
        updatedSavedProcess.steps.forEach((step, index) => {
          console.log(`- Step ${index + 1}: ${step.title}`);
          console.log(`  Video URL: ${step.videoUrl}`);
        });
      }
    } else {
      console.log('Failed to find updated process!');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed.');
    }
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('\nTests completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nUnexpected error:', error);
    process.exit(1);
  });
