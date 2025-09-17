import ApiService from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.USER_KEY = 'currentUser';
  }

  // Login user with username and password
  async login(username, password) {
    try {
      const response = await ApiService.post('/auth/login', {
        username,
        password
      });

      if (response.token) {
        // Store the token in localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        
        // If user info is returned, store it too
        if (response.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }

        return response;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Basic JWT token expiration check
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return tokenData.exp < currentTime;
    } catch (error) {
      // If we can't parse the token, consider it expired
      return true;
    }
  }

  // Refresh authentication status
  checkAuth() {
    if (!this.isAuthenticated() || this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }
}

export default new AuthService();
