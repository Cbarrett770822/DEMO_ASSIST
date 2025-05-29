// API service for making requests to the Netlify functions

// Get all presentations
export const fetchPresentations = async () => {
  try {
    const response = await fetch('/api/getPresentations');
    if (!response.ok) {
      throw new Error('Failed to fetch presentations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching presentations:', error);
    // Fall back to default presentations if API fails
    return [
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
  }
};

// Save presentations
export const savePresentationsToApi = async (presentations) => {
  try {
    const response = await fetch('/api/savePresentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presentations),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save presentations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving presentations:', error);
    throw error;
  }
};

// Get all processes
export const fetchProcesses = async () => {
  try {
    const response = await fetch('/api/getProcesses');
    if (!response.ok) {
      throw new Error('Failed to fetch processes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching processes:', error);
    // Fall back to localStorage if API fails
    const storedProcesses = localStorage.getItem('processes');
    if (storedProcesses) {
      return JSON.parse(storedProcesses);
    }
    
    // If nothing in localStorage, import the default data
    const processData = require('../features/processes/data/processData');
    return processData;
  }
};

// Save processes
export const saveProcessesToApi = async (processes) => {
  try {
    const response = await fetch('/api/saveProcesses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processes),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save processes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving processes:', error);
    throw error;
  }
};
