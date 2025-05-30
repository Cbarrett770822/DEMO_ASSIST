// Service for managing presentations
import { fetchPresentations, savePresentationsToApi } from './apiService';
import { loadPresentations, savePresentations as saveToLocalStorage } from './storageService';
import { isAuthenticated } from './authService';

// Default presentations if none are stored
const defaultPresentations = [
  {
    id: '1',
    title: 'WMS Introduction',
    url: 'https://wms-presentations.s3.amazonaws.com/wms-introduction.pptx',
    description: 'An introduction to Warehouse Management Systems and their benefits',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3'
  },
  {
    id: '2',
    title: 'Inbound Processes',
    url: 'https://wms-presentations.s3.amazonaws.com/inbound-processes.pptx',
    description: 'Detailed overview of receiving and putaway processes',
    isLocal: false,
    fileType: 'pptx',
    sourceType: 's3'
  }
];

/**
 * Get all presentations
 * @returns {Promise<Array>} Promise that resolves to an array of presentation objects
 */
export const getPresentations = async () => {
  try {
    // First try to get presentations from the API
    const response = await fetchPresentations();
    
    // Check if the response has the expected structure
    if (response && response.presentations && Array.isArray(response.presentations)) {
      // Store in localStorage as a backup
      saveToLocalStorage(response.presentations);
      return response.presentations;
    } else if (Array.isArray(response)) {
      // Handle older API format for backward compatibility
      saveToLocalStorage(response);
      return response;
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error fetching presentations from API, falling back to localStorage:', error);
    
    // If API fails, fall back to localStorage
    const storedPresentations = loadPresentations();
    if (storedPresentations && storedPresentations.length > 0) {
      return storedPresentations;
    }
    
    // If nothing in localStorage, return defaults
    return defaultPresentations;
  }
};

/**
 * Save presentations
 * @param {Array} presentations - Array of presentation objects to save
 * @returns {Promise<Object>} Promise that resolves when presentations are saved
 */
export const savePresentations = async (presentations) => {
  try {
    // Validate presentations before saving
    const validatedPresentations = presentations.map(presentation => {
      // Ensure each presentation has an ID
      if (!presentation.id) {
        presentation.id = String(Date.now() + Math.floor(Math.random() * 1000));
      }
      
      // Ensure string IDs for MongoDB
      if (typeof presentation.id !== 'string') {
        presentation.id = String(presentation.id);
      }
      
      // Set default values for new fields if not present
      if (!presentation.fileType) {
        // Try to detect file type from URL
        const url = presentation.url.toLowerCase();
        if (url.endsWith('.ppt')) presentation.fileType = 'ppt';
        else if (url.endsWith('.pptx')) presentation.fileType = 'pptx';
        else if (url.endsWith('.pdf')) presentation.fileType = 'pdf';
        else presentation.fileType = 'other';
      }
      
      if (!presentation.sourceType) {
        // Try to detect source type from URL
        const url = presentation.url.toLowerCase();
        if (presentation.isLocal) {
          presentation.sourceType = 'local';
        } else if (url.includes('s3.amazonaws.com')) {
          presentation.sourceType = 's3';
        } else if (url.includes('dropbox.com')) {
          presentation.sourceType = 'dropbox';
        } else if (url.includes('drive.google.com')) {
          presentation.sourceType = 'gdrive';
        } else if (url.includes('docs.google.com/presentation')) {
          presentation.sourceType = 'gslides';
        } else {
          presentation.sourceType = 'other';
        }
      }
      
      return presentation;
    });
    
    // Check if user is authenticated before saving to API
    if (isAuthenticated()) {
      // First try to save to the API
      await savePresentationsToApi(validatedPresentations);
    }
    
    // Also save to localStorage as a backup
    saveToLocalStorage(validatedPresentations);
    
    return { success: true, presentations: validatedPresentations };
  } catch (error) {
    console.error('Error saving presentations to API, falling back to localStorage only:', error);
    
    // If API fails, at least save to localStorage
    saveToLocalStorage(presentations);
    
    return { success: false, error: error.message, presentations };
  }
};

/**
 * Get a presentation by ID
 * @param {string} id - The presentation ID
 * @returns {Promise<Object|null>} Promise that resolves to the presentation object or null if not found
 */
export const getPresentationById = async (id) => {
  const presentations = await getPresentations();
  // Handle both string and number IDs for backward compatibility
  return presentations.find(p => p.id === id || p.id === Number(id) || String(p.id) === id) || null;
};

/**
 * Add a new presentation
 * @param {Object} presentation - The presentation object to add
 * @returns {Promise<Object>} Promise that resolves to the saved presentation
 */
export const addPresentation = async (presentation) => {
  // Get existing presentations
  const presentations = await getPresentations();
  
  // Generate a new ID if not provided
  if (!presentation.id) {
    presentation.id = String(Date.now() + Math.floor(Math.random() * 1000));
  }
  
  // Add the new presentation
  const updatedPresentations = [...presentations, presentation];
  
  // Save the updated list
  const result = await savePresentations(updatedPresentations);
  
  if (result.success) {
    return { success: true, presentation };
  } else {
    return { success: false, error: result.error };
  }
};

/**
 * Update an existing presentation
 * @param {string} id - The ID of the presentation to update
 * @param {Object} updatedData - The updated presentation data
 * @returns {Promise<Object>} Promise that resolves to the updated presentation
 */
export const updatePresentation = async (id, updatedData) => {
  // Get existing presentations
  const presentations = await getPresentations();
  
  // Find the presentation to update
  const index = presentations.findIndex(p => p.id === id || p.id === Number(id) || String(p.id) === id);
  
  if (index === -1) {
    return { success: false, error: 'Presentation not found' };
  }
  
  // Update the presentation
  const updatedPresentation = { ...presentations[index], ...updatedData };
  const updatedPresentations = [...presentations];
  updatedPresentations[index] = updatedPresentation;
  
  // Save the updated list
  const result = await savePresentations(updatedPresentations);
  
  if (result.success) {
    return { success: true, presentation: updatedPresentation };
  } else {
    return { success: false, error: result.error };
  }
};

/**
 * Delete a presentation
 * @param {string} id - The ID of the presentation to delete
 * @returns {Promise<Object>} Promise that resolves when the presentation is deleted
 */
export const deletePresentation = async (id) => {
  // Get existing presentations
  const presentations = await getPresentations();
  
  // Filter out the presentation to delete
  const updatedPresentations = presentations.filter(p => p.id !== id && p.id !== Number(id) && String(p.id) !== id);
  
  if (updatedPresentations.length === presentations.length) {
    return { success: false, error: 'Presentation not found' };
  }
  
  // Save the updated list
  const result = await savePresentations(updatedPresentations);
  
  if (result.success) {
    return { success: true };
  } else {
    return { success: false, error: result.error };
  }
};
