const fs = require('fs');
const path = require('path');

/**
 * Reads data from ES module files that use export default
 * @param {string} filePath - Path to the ES module file
 * @param {string} exportName - Name of the exported variable (usually the filename without extension)
 * @returns {object} - The parsed data
 */
function readESModuleData(filePath, exportName) {
  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Find the data definition (assuming it's in format: const exportName = [...])
    const dataRegex = new RegExp(`const\\s+${exportName}\\s*=\\s*(\\[\\s*{[\\s\\S]*?\\}\\s*\\]);`, 'm');
    const match = fileContent.match(dataRegex);
    
    if (match && match[1]) {
      // Convert the string to a JavaScript object
      // This is safer than using eval
      const jsonString = match[1]
        .replace(/'/g, '"')              // Replace single quotes with double quotes
        .replace(/,(\s*[}\]])/g, '$1')   // Remove trailing commas
        .replace(/(\w+):/g, '"$1":')     // Add quotes around property names
        .replace(/\/\/.+/g, '')          // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\n/g, ' ');            // Remove newlines
      
      try {
        return JSON.parse(jsonString);
      } catch (jsonError) {
        console.error('Error parsing JSON from file content:', jsonError);
        // Fallback to empty array
        return [];
      }
    } else {
      console.error(`Could not find ${exportName} data in file`);
      return [];
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

module.exports = {
  readESModuleData
};
