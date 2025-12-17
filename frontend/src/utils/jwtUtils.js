/**
 * JWT Utility Functions
 * Helper functions to decode JWT tokens and extract user information
 */

/**
 * Decode a JWT token and return the payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token structure');
      return null;
    }
    
    // Decode the payload (base64url)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Get user information from JWT token
 * @param {string} token - JWT token (optional, will get from localStorage if not provided)
 * @returns {object|null} - User info object or null
 */
export const getUserInfoFromToken = (token = null) => {
  // Get token from parameter or localStorage
  const jwtToken = token || localStorage.getItem('authToken') || localStorage.getItem('tindigwa_token');
  
  if (!jwtToken) {
    console.warn('No JWT token found');
    return null;
  }
  
  const payload = decodeJWT(jwtToken);
  if (!payload) return null;
  
  // Extract user information from token payload
  return {
    email: payload.sub || payload.email, // subject is typically the email
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    fullName: payload.fullName || '',
    role: payload.role || '',
    userId: payload.userId || null,
    exp: payload.exp, // expiration time
    iat: payload.iat  // issued at
  };
};

/**
 * Get user's first name from JWT token
 * @param {string} token - JWT token (optional)
 * @returns {string} - First name or fallback
 */
export const getFirstNameFromToken = (token = null) => {
  const userInfo = getUserInfoFromToken(token);
  return userInfo?.firstName || 'User';
};

/**
 * Get user's full name from JWT token
 * @param {string} token - JWT token (optional)
 * @returns {string} - Full name or fallback
 */
export const getFullNameFromToken = (token = null) => {
  const userInfo = getUserInfoFromToken(token);
  return userInfo?.fullName || userInfo?.firstName || 'User';
};

/**
 * Get user's role from JWT token
 * @param {string} token - JWT token (optional)
 * @returns {string} - User role
 */
export const getRoleFromToken = (token = null) => {
  const userInfo = getUserInfoFromToken(token);
  return userInfo?.role || '';
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token (optional)
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (token = null) => {
  const userInfo = getUserInfoFromToken(token);
  if (!userInfo || !userInfo.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return userInfo.exp < currentTime;
};

/**
 * Check if user is authenticated (has valid, non-expired token)
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('tindigwa_token');
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Get formatted user display name
 * @param {string} token - JWT token (optional)
 * @returns {string} - Display name for UI
 */
export const getUserDisplayName = (token = null) => {
  const userInfo = getUserInfoFromToken(token);
  if (!userInfo) return 'User';
  
  // Priority: fullName > firstName > email username part
  if (userInfo.fullName) return userInfo.fullName;
  if (userInfo.firstName) return userInfo.firstName;
  if (userInfo.email) {
    // Extract name from email (e.g., john.doe@example.com -> john.doe)
    return userInfo.email.split('@')[0].replace(/\./g, ' ');
  }
  
  return 'User';
};

/**
 * Log token information (for debugging)
 * @param {string} token - JWT token (optional)
 */
export const debugToken = (token = null) => {
  const jwtToken = token || localStorage.getItem('authToken') || localStorage.getItem('tindigwa_token');
  
  if (!jwtToken) {
    console.log('🔍 No JWT token found');
    return;
  }
  
  const payload = decodeJWT(jwtToken);
  if (!payload) {
    console.log('🔍 Invalid JWT token');
    return;
  }
  
  console.log('🔍 JWT Token Info:', {
    email: payload.sub,
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName: payload.fullName,
    role: payload.role,
    userId: payload.userId,
    expiresAt: new Date(payload.exp * 1000).toLocaleString(),
    issuedAt: new Date(payload.iat * 1000).toLocaleString(),
    isExpired: isTokenExpired(jwtToken)
  });
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  decodeJWT,
  getUserInfoFromToken,
  getFirstNameFromToken,
  getFullNameFromToken,
  getRoleFromToken,
  isTokenExpired,
  isAuthenticated,
  getUserDisplayName,
  debugToken
};