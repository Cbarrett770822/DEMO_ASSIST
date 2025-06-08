// Script to view MongoDB data directly
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.development.local' });

// MongoDB connection URI - use the direct Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test';

console.log('Using MongoDB URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password in logs

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// View presentations collection and other relevant data
async function viewDatabaseData() {
  const db = await connectToDatabase();
  
  console.log('\n=== MongoDB Database Contents ===\n');
  
  // Define schema for the presentations collection
  const PresentationSchema = new mongoose.Schema({
    title: String,
    description: String,
    slides: Array,
    createdBy: String,
    createdAt: Date,
    lastUpdated: Date,
    tags: Array,
    status: String,
    version: String,
    isPublic: Boolean
  });
  
  // Create model
  const Presentation = mongoose.models.Presentation || mongoose.model('Presentation', PresentationSchema);
  
  // Get all collections
  console.log('\n--- Available Collections ---');
  const collections = await mongoose.connection.db.listCollections().toArray();
  collections.forEach(collection => {
    console.log(`- ${collection.name}`);
  });
  
  // Get presentations using the model
  console.log('\n--- Presentations Collection ---');
  try {
    const presentations = await Presentation.find({}).lean();
    console.log(`Found ${presentations.length} presentations:`);
    
    if (presentations.length === 0) {
      console.log('No presentations found in the database');
    } else {
      presentations.forEach((presentation, index) => {
        console.log(`\nPresentation ${index + 1}: ${presentation.title || 'Untitled Presentation'}`);
        
        // Print basic presentation info without slides to keep output manageable
        const { slides, ...presentationInfo } = presentation;
        console.log(JSON.stringify(presentationInfo, null, 2));
        
        // Print slide count and titles
        if (slides && slides.length > 0) {
          console.log(`\nSlides (${slides.length} total):`);
          slides.forEach((slide, slideIndex) => {
            console.log(`  Slide ${slideIndex + 1}: ${slide.title || 'Untitled Slide'}`);
          });
        } else {
          console.log('No slides in this presentation');
        }
        
        console.log('-----------------------------------');
      });
    }
  } catch (error) {
    console.log('Error fetching presentations:', error.message);
  }
  
  // Get raw presentations collection data
  console.log('\n--- Raw Presentations Collection Data ---');
  try {
    const rawPresentations = await mongoose.connection.db.collection('presentations').find({}).toArray();
    console.log(`Found ${rawPresentations.length} raw presentation documents:`);
    
    if (rawPresentations.length === 0) {
      console.log('No presentations found in the raw collection');
    } else {
      rawPresentations.forEach((presentation, index) => {
        console.log(`\nRaw Presentation ${index + 1}: ${presentation.title || 'Untitled'}`);
        
        // Print full presentation data including metadata
        const { _id, title, description, createdBy, createdAt, lastUpdated, status, version } = presentation;
        console.log(JSON.stringify({ _id, title, description, createdBy, createdAt, lastUpdated, status, version }, null, 2));
        
        // Print slide count and titles without full content
        if (presentation.slides && presentation.slides.length > 0) {
          console.log(`\nContains ${presentation.slides.length} slides:`);
          presentation.slides.slice(0, 5).forEach((slide, slideIndex) => {
            console.log(`  Slide ${slideIndex + 1}: ${slide.title || 'Untitled'} (Type: ${slide.type || 'unknown'})`);
          });
          
          if (presentation.slides.length > 5) {
            console.log(`  ... and ${presentation.slides.length - 5} more slides`);
          }
        } else {
          console.log('No slides in this presentation');
        }
        
        console.log('-----------------------------------');
      });
    }
  } catch (error) {
    console.log('Error fetching raw presentations:', error.message);
  }
  
  // Close the connection
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
}

// Run the script
viewDatabaseData().catch(console.error);
