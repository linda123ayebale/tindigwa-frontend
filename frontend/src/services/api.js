// API Configuration and Base Service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
// const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000; // Unused for now

// Debug logging enabled for troubleshooting
const DEBUG_MODE = true;

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('tindigwa_token');
};

// Helper function to clear authentication data
const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('tindigwa_token');
  localStorage.removeItem('tindigwa_setup_complete');
};

// Helper function to redirect to login
const redirectToLogin = () => {
  clearAuthData();
  // Use window.location instead of navigate to ensure clean reload
  window.location.href = '/login';
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Base API class with common functionality
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('🌐 API Service initialized with baseURL:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options
    };

    if (DEBUG_MODE) {
      console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
      console.log('📤 Config:', config);
    }

    try {
      const response = await fetch(url, config);
      
      if (DEBUG_MODE) {
        console.log(`📥 Response Status: ${response.status} ${response.statusText}`);
      }
      
      // Handle token expiration (403 Forbidden)
      if (response.status === 403) {
        // Check if this request had an Authorization header (meaning user was logged in)
        const hasAuthHeader = config.headers && config.headers.Authorization;
        
        if (hasAuthHeader) {
          if (DEBUG_MODE) console.log('🔐 Token expired - but not auto-redirecting');
          
          // Don't automatically redirect to login - let the calling component handle it
          // This prevents interrupting successful operations that happen to have expired tokens
          // Only auto-redirect for specific endpoints that definitely need fresh auth
          if (endpoint.includes('/auth/') && !endpoint.includes('/auth/setup-status')) {
            setTimeout(() => redirectToLogin(), 100);
          }
        }
        
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        if (DEBUG_MODE) console.log('✅ No Content Response');
        return null;
      }

      // Handle empty responses (like 403 with no body)
      const contentLength = response.headers.get('Content-Length');
      if (contentLength === '0' || !response.headers.get('Content-Type')?.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return null;
      }

      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log('📊 Response Data:', data);
      }

      if (!response.ok) {
        // Backend can return either 'message' or 'error' field
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        if (DEBUG_MODE) console.error('❌ API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (DEBUG_MODE) console.log('✅ API Request Successful');
      return data;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('🚨 API Request Failed:', error);
        console.error('🔍 URL:', url);
        console.error('🔧 Config:', config);
      }
      
      // Enhanced error messages for common issues
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${this.baseURL}`);
      }
      
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ApiService();
export { getAuthToken, clearAuthData };