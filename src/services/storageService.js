/**
 * Storage Service
 * 
 * This service provides functions to save and load data to/from localStorage.
 * It's used to persist video assignments and presentations between app sessions.
 */

// Keys for storing data in localStorage
const PROCESS_DATA_KEY = 'wms_process_data';
const PRESENTATIONS_KEY = 'wms_presentations';
const NOTES_KEY = 'wms_voice_notes';

/**
 * Save processes data to localStorage
 * @param {Array} processes - Array of process objects
 */
export const saveProcesses = (processes) => {
  try {
    localStorage.setItem(PROCESS_DATA_KEY, JSON.stringify(processes));
    return true;
  } catch (error) {
    console.error('Error saving processes to localStorage:', error);
    return false;
  }
};

/**
 * Load processes data from localStorage
 * @returns {Array|null} - Array of process objects or null if not found
 */
export const loadProcesses = () => {
  try {
    const data = localStorage.getItem(PROCESS_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading processes from localStorage:', error);
    return null;
  }
};

/**
 * Check if processes data exists in localStorage
 * @returns {boolean} - True if processes data exists, false otherwise
 */
export const hasStoredProcesses = () => {
  return localStorage.getItem(PROCESS_DATA_KEY) !== null;
};

/**
 * Clear processes data from localStorage
 */
export const clearProcesses = () => {
  try {
    localStorage.removeItem(PROCESS_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing processes from localStorage:', error);
    return false;
  }
};

/**
 * Save presentations data to localStorage
 * @param {Array} presentations - Array of presentation objects
 */
export const savePresentations = (presentations) => {
  try {
    localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(presentations));
    return true;
  } catch (error) {
    console.error('Error saving presentations to localStorage:', error);
    return false;
  }
};

/**
 * Load presentations data from localStorage
 * @returns {Array|null} - Array of presentation objects or null if not found
 */
export const loadPresentations = () => {
  try {
    const data = localStorage.getItem(PRESENTATIONS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading presentations from localStorage:', error);
    return null;
  }
};

/**
 * Check if presentations data exists in localStorage
 * @returns {boolean} - True if presentations data exists, false otherwise
 */
export const hasStoredPresentations = () => {
  return localStorage.getItem(PRESENTATIONS_KEY) !== null;
};

/**
 * Clear presentations data from localStorage
 */
export const clearPresentations = () => {
  try {
    localStorage.removeItem(PRESENTATIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing presentations from localStorage:', error);
    return false;
  }
};

/**
 * Save voice notes to localStorage
 * @param {Array} notes - Array of note objects
 */
export const saveNotes = (notes) => {
  try {
    // We need to serialize the audio blobs to store them
    const serializableNotes = notes.map(note => {
      // Create a new object without the audioBlob property
      const { audioBlob, ...noteWithoutAudio } = note;
      return noteWithoutAudio;
    });
    
    localStorage.setItem(NOTES_KEY, JSON.stringify(serializableNotes));
    return true;
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
    return false;
  }
};

/**
 * Load voice notes from localStorage
 * @returns {Array|null} - Array of note objects or null if not found
 */
export const loadNotes = () => {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    return null;
  }
};

/**
 * Check if voice notes exist in localStorage
 * @returns {boolean} - True if notes exist, false otherwise
 */
export const hasStoredNotes = () => {
  return localStorage.getItem(NOTES_KEY) !== null;
};

/**
 * Clear voice notes from localStorage
 */
export const clearNotes = () => {
  try {
    localStorage.removeItem(NOTES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notes from localStorage:', error);
    return false;
  }
};
