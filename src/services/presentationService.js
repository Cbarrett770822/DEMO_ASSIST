// Service for managing presentations
import { fetchPresentations, savePresentationsToApi } from './apiService';
import { loadPresentations, savePresentations as saveToLocalStorage } from './storageService';

// Default presentations if none are stored
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

/**
 * Get all presentations
 * @returns {Promise<Array>} Promise that resolves to an array of presentation objects
 */
export const getPresentations = async () => {
  try {
    // First try to get presentations from the API
    const apiPresentations = await fetchPresentations();
    return apiPresentations;
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
    // First try to save to the API
    await savePresentationsToApi(presentations);
    
    // Also save to localStorage as a backup
    saveToLocalStorage(presentations);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving presentations to API, falling back to localStorage only:', error);
    
    // If API fails, at least save to localStorage
    saveToLocalStorage(presentations);
    
    return { success: false, error: error.message };
  }
};

/**
 * Get a presentation by ID
 * @param {number} id - The presentation ID
 * @returns {Promise<Object|null>} Promise that resolves to the presentation object or null if not found
 */
export const getPresentationById = async (id) => {
  const presentations = await getPresentations();
  return presentations.find(p => p.id === id) || null;
};
