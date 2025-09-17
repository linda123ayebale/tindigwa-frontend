// API Configuration and Base Service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;// Debug logging in developmentconst DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
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
      
      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        if (DEBUG_MODE) console.log('✅ No Content Response');
        return null;
      }

      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log('📊 Response Data:', data);
      }

      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
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
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080');
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

export default new ApiService();
export { getAuthToken };
