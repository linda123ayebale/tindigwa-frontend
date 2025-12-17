/**
 * Universal ID Formatter Utility
 * 
 * Formats IDs stored as LN250001 in the database (8 chars max)
 * Display format: LN-25-0001
 * 
 * Pattern: <PREFIX><YY><SEQ>
 * Display: <PREFIX>-<YY>-<SEQ>
 */

/**
 * Format a universal ID with hyphens for display
 * @param {string} id - ID without hyphens (e.g., "LN250001")
 * @returns {string} Formatted ID with hyphens (e.g., "LN-25-0001")
 */
export const formatIdWithHyphens = (id) => {
  if (!id || typeof id !== 'string') {
    return id;
  }

  // Expected pattern: <PREFIX><YY><SEQ>
  // 2 char prefix + 2 char year + 4 char sequence = 8 chars
  // Examples: LN250001, PM250014, EX250007

  const len = id.length;
  if (len !== 8) {
    // Not the expected 8-character format, return as-is
    return id;
  }

  // Extract components
  const prefix = id.slice(0, 2);    // First 2 chars
  const year = id.slice(2, 4);      // Next 2 chars
  const sequence = id.slice(4, 8);  // Last 4 chars
  
  return `${prefix}-${year}-${sequence}`;
};

/**
 * Remove hyphens from a formatted ID to get database format
 * @param {string} formattedId - ID with hyphens (e.g., "LN-KLA-2511-0005")
 * @returns {string} ID without hyphens (e.g., "LNKLA25110005")
 */
export const removeHyphensFromId = (formattedId) => {
  if (!formattedId || typeof formattedId !== 'string') {
    return formattedId;
  }
  return formattedId.replace(/-/g, '');
};

/**
 * Validate if a string looks like a universal ID
 * @param {string} id - ID to validate
 * @returns {boolean} True if ID appears valid
 */
export const isValidUniversalId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Remove hyphens if present
  const cleanId = removeHyphensFromId(id);
  
  // Should be exactly 8 characters
  if (cleanId.length !== 8) {
    return false;
  }
  
  // Last 6 characters should be digits (YY + sequence)
  const last6 = cleanId.slice(2);
  return /^\d{6}$/.test(last6);
};

/**
 * Extract components from a universal ID
 * @param {string} id - ID with or without hyphens
 * @returns {object} Object with prefix, year, sequence
 */
export const parseUniversalId = (id) => {
  if (!id || typeof id !== 'string') {
    return null;
  }
  
  const cleanId = removeHyphensFromId(id);
  
  if (!isValidUniversalId(cleanId)) {
    return null;
  }
  
  const prefix = cleanId.slice(0, 2);
  const year = cleanId.slice(2, 4);
  const sequence = cleanId.slice(4, 8);
  
  return {
    prefix,
    year,
    sequence,
    formatted: `${prefix}-${year}-${sequence}`,
    raw: cleanId
  };
};

export default {
  formatIdWithHyphens,
  removeHyphensFromId,
  isValidUniversalId,
  parseUniversalId
};
