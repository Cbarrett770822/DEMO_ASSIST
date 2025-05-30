// API service for making requests to the Netlify functions

// Development mode - set to true to use mock data instead of API calls
const DEV_MODE = true;

// Mock data for development mode
const MOCK_PRESENTATIONS = [
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

// Load presentations from localStorage or use mock data
const loadMockPresentations = () => {
  const storedPresentations = localStorage.getItem('wms_presentations');
  if (storedPresentations) {
    try {
      return JSON.parse(storedPresentations);
    } catch (error) {
      console.error('Error parsing stored presentations:', error);
    }
  }
  return MOCK_PRESENTATIONS;
};

// Save presentations to localStorage
const saveMockPresentations = (presentations) => {
  localStorage.setItem('wms_presentations', JSON.stringify(presentations));
  return presentations;
};

// Get all presentations
export const fetchPresentations = async () => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const presentations = loadMockPresentations();
        resolve({ presentations });
      }, 300); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const response = await fetch('/api/getPresentations');
    if (!response.ok) {
      throw new Error('Failed to fetch presentations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching presentations:', error);
    // Fall back to default presentations if API fails
    return { 
      presentations: MOCK_PRESENTATIONS
    };
  }
};

// Save presentations
export const savePresentationsToApi = async (presentations) => {
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedPresentations = saveMockPresentations(presentations);
        resolve({ success: true, presentations: savedPresentations });
      }, 300); // Simulate network delay
    });
  }
  
  // In production mode, use API
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
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Try to get from localStorage first
        const storedProcesses = localStorage.getItem('wms_processes');
        if (storedProcesses) {
          try {
            resolve(JSON.parse(storedProcesses));
            return;
          } catch (error) {
            console.error('Error parsing stored processes:', error);
          }
        }
        
        // If nothing in localStorage, import the default data
        const processData = require('../features/processes/data/processData');
        resolve(processData);
      }, 300); // Simulate network delay
    });
  }
  
  // In production mode, use API
  try {
    const response = await fetch('/api/getProcesses');
    if (!response.ok) {
      throw new Error('Failed to fetch processes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching processes:', error);
    // Fall back to localStorage if API fails
    const storedProcesses = localStorage.getItem('wms_processes');
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
  // In development mode, use mock data
  if (DEV_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('wms_processes', JSON.stringify(processes));
        resolve({ success: true, processes });
      }, 300); // Simulate network delay
    });
  }
  
  // In production mode, use API
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
