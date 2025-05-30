const { connectToDatabase } = require('./utils/mongodb');
const Presentation = require('./models/Presentation');
const { authenticateUser } = require('./utils/auth');

// Default presentations if none are stored
const defaultPresentations = [
  {
    id: '1',
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Optional authentication - if token is provided, verify it
    if (event.headers && event.headers.authorization) {
      const authResult = await authenticateUser(event);
      if (authResult.error) {
        return {
          statusCode: authResult.statusCode,
          body: JSON.stringify({ error: authResult.error })
        };
      }
    }

    // Connect to the database
    await connectToDatabase();
    
    // Get all presentations
    let presentations = await Presentation.find().lean();
    
    // If no presentations are found, return the default ones
    if (!presentations || presentations.length === 0) {
      // Try to initialize with default presentations
      try {
        const presentationModels = await Presentation.create(defaultPresentations);
        presentations = presentationModels.map(model => model.toObject());
        console.log('Initialized presentations with default data');
      } catch (initError) {
        console.error('Error initializing presentations:', initError);
        return {
          statusCode: 200,
          body: JSON.stringify({
            presentations: defaultPresentations,
            source: 'default'
          })
        };
      }
    }
    
    // Process presentations to add direct URLs and viewer URLs
    const processedPresentations = presentations.map(presentation => {
      // Create a temporary model instance to use the methods
      const tempModel = new Presentation(presentation);
      
      return {
        ...presentation,
        directUrl: tempModel.getDirectUrl(),
        viewerUrl: tempModel.getViewerUrl()
      };
    });
    
    // Return presentations
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify({
        presentations: processedPresentations,
        source: 'database',
        count: processedPresentations.length
      })
    };
  } catch (error) {
    console.error('Error getting presentations:', error);
    
    // Return default presentations in case of error
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to get presentations from database',
        message: error.message,
        presentations: defaultPresentations,
        source: 'default'
      })
    };
  }
};
