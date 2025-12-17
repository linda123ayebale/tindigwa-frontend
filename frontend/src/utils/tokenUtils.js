// JWT Token utility functions

/**
 * Decode JWT token without verification (for client-side expiration checking)
 * @param {string} token - The JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  
  try {
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return true; // Treat invalid tokens as expired
  }
  
  // JWT exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  
  return decoded.exp < currentTime;
};

/**
 * Get token expiration date
 * @param {string} token - The JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpirationDate = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return null;
  }
  
  return new Date(decoded.exp * 1000);
};

/**
 * Get time until token expires
 * @param {string} token - The JWT token
 * @returns {number} - Milliseconds until expiration, or 0 if expired
 */
export const getTimeUntilExpiry = (token) => {
  const expirationDate = getTokenExpirationDate(token);
  
  if (!expirationDate) {
    return 0;
  }
  
  const timeUntilExpiry = expirationDate.getTime() - Date.now();
  return Math.max(0, timeUntilExpiry);
};