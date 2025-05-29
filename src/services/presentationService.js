// Service for managing presentations
import { loadPresentations } from './storageService';

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
 * @returns {Array} Array of presentation objects
 */
export const getPresentations = () => {
  const storedPresentations = loadPresentations();
  if (storedPresentations && storedPresentations.length > 0) {
    return storedPresentations;
  }
  return defaultPresentations;
};

/**
 * Get a presentation by ID
 * @param {number} id - The presentation ID
 * @returns {Object|null} The presentation object or null if not found
 */
export const getPresentationById = (id) => {
  const presentations = getPresentations();
  return presentations.find(p => p.id === id) || null;
};
