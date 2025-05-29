const { connectToDatabase } = require('./utils/mongodb');
const Presentation = require('./models/Presentation');

exports.handler = async (event, context) => {
  // Make sure we're using the correct HTTP method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all presentations
    const presentations = await Presentation.find({}).sort({ id: 1 });
    
    // If no presentations found, return default ones
    if (presentations.length === 0) {
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
      
      return {
        statusCode: 200,
        body: JSON.stringify(defaultPresentations)
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(presentations)
    };
  } catch (error) {
    console.error('Database error:', error);
    
    // Return default presentations on error
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
    
    return {
      statusCode: 200,
      body: JSON.stringify(defaultPresentations)
    };
  }
};
