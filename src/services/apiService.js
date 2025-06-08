// API service for making requests to the Netlify functions
import config from '../config';

// Auto-detect development mode based on environment or hostname
const isDevelopment = process.env.NODE_ENV === 'development' || 
  !process.env.NODE_ENV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Database API endpoints
const API_ENDPOINTS = {
  PRESENTATIONS: `${config.apiUrl}/getPresentations`,
  SAVE_PRESENTATIONS: `${config.apiUrl}/savePresentations`,
  PROCESSES: `${config.apiUrl}/getProcesses`,
  SAVE_PROCESSES: `${config.apiUrl}/saveProcesses`,
  SETTINGS: `${config.apiUrl}/getSettings`,
  SAVE_SETTINGS: `${config.apiUrl}/saveSettings`,
  NOTES: `${config.apiUrl}/getNotes`,
  SAVE_NOTES: `${config.apiUrl}/saveNotes`
};

// Empty fallback data (no more mock data)
const EMPTY_PRESENTATIONS = [];

// Load presentations from localStorage (only as a cache, not as primary source)
const loadCachedPresentations = () => {
  const storedPresentations = localStorage.getItem('wms_presentations');
  if (storedPresentations) {
    try {
      return JSON.parse(storedPresentations);
    } catch (error) {
      console.error('Error parsing stored presentations:', error);
    }
  }
  return EMPTY_PRESENTATIONS;
};

// Save presentations to localStorage as a cache
const cachePresentations = (presentations) => {
  localStorage.setItem('wms_presentations', JSON.stringify(presentations));
  return presentations;
};

// Get all presentations from database
export const fetchPresentations = async () => {
  // Load cached data for immediate display while we fetch from database
  const cachedPresentations = loadCachedPresentations();
  
  // Always try to fetch from database, regardless of development mode
  try {
    console.log('Fetching presentations from database...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(API_ENDPOINTS.PRESENTATIONS, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched presentations from API');
    
    // If we got empty data from the API, return empty array
    if (!data.presentations || data.presentations.length === 0) {
      console.log('Database returned empty presentations');
      return { presentations: [], source: 'database' };
    }
    
    // Cache the database data to localStorage for faster loading next time
    cachePresentations(data.presentations);
    return data;
  } catch (error) {
    console.error('Error fetching presentations from API:', error);
    // If database fetch fails, use cached data but indicate the error
    return { 
      presentations: cachedPresentations,
      source: 'cache',
      error: error.message
    };
  }
};

// Save presentations to database
export const savePresentationsToApi = async (presentations) => {
  // Always save to database, regardless of development mode
  try {
  
    // Cache the data locally while we save to database
    cachePresentations(presentations);
    
    const response = await fetch(API_ENDPOINTS.SAVE_PRESENTATIONS, {
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
  // Load cached data for immediate display while we fetch from database
  let cachedProcesses = [];
  const storedProcesses = localStorage.getItem('wms_processes');
  if (storedProcesses) {
    try {
      cachedProcesses = JSON.parse(storedProcesses);
    } catch (error) {
      console.error('Error parsing stored processes:', error);
    }
  }
  
  // Always try to fetch from database
  try {
    console.log('Fetching processes from database...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(API_ENDPOINTS.PROCESSES, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched processes from database');
    
    // If we got empty data from the API, return empty array
    if (!data.processes || data.processes.length === 0) {
      console.log('Database returned empty processes');
      return { processes: [], source: 'database' };
    }
    
    // Cache the database data to localStorage for faster loading next time
    localStorage.setItem('wms_processes', JSON.stringify(data.processes));
    return data;
  } catch (error) {
    console.error('Error fetching processes from database:', error);
    // If database fetch fails, use cached data but indicate the error
    return { 
      processes: cachedProcesses,
      source: 'cache',
      error: error.message
    };
  }
};

// Save processes
export const saveProcessesToApi = async (processes) => {
  // Always save to database
  try {
    // Cache the data locally while we save to database
    localStorage.setItem('wms_processes', JSON.stringify(processes));
    const response = await fetch(API_ENDPOINTS.SAVE_PROCESSES, {
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
