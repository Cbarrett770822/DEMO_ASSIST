// Script to initialize MongoDB database with default data
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const uri = process.env.MONGODB_URI;

// Since we can't directly require ES modules in CommonJS, we'll define the process data here
// This is a simplified version of the data for initialization purposes
const processData = [
  {
    id: 'receiving',
    name: 'Receiving',
    description: 'Process for receiving goods into the warehouse',
    steps: [
      {
        title: 'Truck Check-In',
        description: 'Verify truck arrival details against scheduled appointments',
        videoUrl: 'https://www.youtube.com/watch?v=example1'
      },
      {
        title: 'Unload Goods',
        description: 'Safely unload goods from the truck',
        videoUrl: 'https://www.youtube.com/watch?v=example2'
      },
      {
        title: 'Quality Inspection',
        description: 'Inspect received goods for quality and damage',
        videoUrl: 'https://www.youtube.com/watch?v=example3'
      }
    ]
  },
  {
    id: 'putaway',
    name: 'Putaway',
    description: 'Process for storing goods in the warehouse',
    steps: [
      {
        title: 'Assign Storage Location',
        description: 'Determine the optimal storage location for goods',
        videoUrl: 'https://www.youtube.com/watch?v=example4'
      },
      {
        title: 'Transport to Location',
        description: 'Move goods to assigned storage location',
        videoUrl: 'https://www.youtube.com/watch?v=example5'
      },
      {
        title: 'Confirm Putaway',
        description: 'Scan and confirm goods are stored in the correct location',
        videoUrl: 'https://www.youtube.com/watch?v=example6'
      }
    ]
  }
]

// Default presentations
const defaultPresentations = [
  {
    id: 1,
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false
  },
  {
    id: 2,
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false
  }
];

// Define schemas
const PresentationSchema = new mongoose.Schema({
  id: Number,
  title: String,
  url: String,
  description: String,
  isLocal: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StepSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String
});

const ProcessSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  steps: [StepSchema]
});

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create models
    const Presentation = mongoose.model('Presentation', PresentationSchema);
    const Process = mongoose.model('Process', ProcessSchema);

    // Clear existing data
    await Presentation.deleteMany({});
    await Process.deleteMany({});
    console.log('Cleared existing data');

    // Insert default presentations
    await Presentation.insertMany(defaultPresentations);
    console.log('Inserted default presentations');

    // Insert default processes
    await Process.insertMany(processData);
    console.log('Inserted default processes');

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeDatabase();
