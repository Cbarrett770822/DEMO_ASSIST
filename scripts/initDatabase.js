// Script to initialize MongoDB database with default data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const uri = process.env.MONGODB_URI;

// Define process data directly since we can't easily import ES modules in CommonJS
// This is a simplified version of the data in processData.js
const processData = [
  {
    id: 'receiving',
    category: 'inbound',
    title: 'Receiving',
    description: 'The process of accepting deliveries from suppliers, verifying quantities and quality.',
    steps: [
      { 
        title: 'Appointment Scheduling', 
        description: 'Schedule delivery appointments through the WMS to optimize dock utilization and labor planning.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Arrival and Check-in', 
        description: 'Register the arrival of the delivery and assign it to a dock door using the WMS.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ]
  },
  {
    id: 'putaway',
    category: 'inbound',
    title: 'Putaway',
    description: 'The process of moving received items to their designated storage locations.',
    steps: [
      { 
        title: 'Task Assignment', 
        description: 'WMS automatically assigns putaway tasks to operators based on priority and location.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      { 
        title: 'Location Selection', 
        description: 'System suggests optimal storage locations based on item characteristics and warehouse rules.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ]
  }
];

// Default presentations if none are stored
const presentationData = [
  {
    id: '1',
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false
  },
  {
    id: '2',
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false
  }
];

// Define schemas
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PresentationSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  url: String,
  isLocal: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ProcessSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  steps: [
    {
      id: String,
      title: String,
      description: String,
      videoUrl: String,
      completed: Boolean
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Default users
const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123', // This will be hashed before saving
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123', // This will be hashed before saving
    role: 'user'
  }
];

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create models
    const User = mongoose.model('User', UserSchema);
    const Presentation = mongoose.model('Presentation', PresentationSchema);
    const Process = mongoose.model('Process', ProcessSchema);

    // Initialize users
    const existingUsers = await User.find();
    if (existingUsers.length === 0) {
      // Create default users with hashed passwords
      const usersToCreate = await Promise.all(defaultUsers.map(async user => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return {
          ...user,
          password: hashedPassword
        };
      }));
      
      // Insert users
      await User.insertMany(usersToCreate);
      console.log(`Created ${usersToCreate.length} default users:`);
      usersToCreate.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
      });
    } else {
      console.log(`Found ${existingUsers.length} existing users. Skipping user initialization.`);
    }

    // Initialize presentations
    const existingPresentations = await Presentation.find();
    if (existingPresentations.length === 0) {
      // Add timestamps to presentation data
      const presentationsWithTimestamps = presentationData.map(presentation => ({
        ...presentation,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Insert presentations
      await Presentation.insertMany(presentationsWithTimestamps);
      console.log(`Created ${presentationsWithTimestamps.length} default presentations`);
    } else {
      console.log(`Found ${existingPresentations.length} existing presentations. Skipping presentation initialization.`);
    }

    // Initialize processes
    const existingProcesses = await Process.find();
    if (existingProcesses.length === 0) {
      // Add timestamps to process data
      const processesWithTimestamps = processData.map(process => ({
        ...process,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Insert processes
      await Process.insertMany(processesWithTimestamps);
      console.log(`Created ${processesWithTimestamps.length} default processes`);
    } else {
      console.log(`Found ${existingProcesses.length} existing processes. Skipping process initialization.`);
    }

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
