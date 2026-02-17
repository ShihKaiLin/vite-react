/**
 * Cloud Functions Entry Point
 */

const { extractPropertyInfo } = require('./extractPropertyInfo');
const { generateShareCopy } = require('./generateShareCopy');

// Export all functions
exports.extractPropertyInfo = extractPropertyInfo;
exports.generateShareCopy = generateShareCopy;
