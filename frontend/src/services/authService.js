import ApiService from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.USER_KEY = 'currentUser';
    this.USERNAME_KEY = 'username'; // For backward compatibility
  }

  // Decode JWT token to extract user information
  decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Login user with username and password
  async login(username, password) {
    try {
      const response = await ApiService.post('/auth/login', {
        username,
        password
      });

      // Check if OTP is required (2FA enabled)
      if (response.requiresOtp) {
        // Store user info temporarily for OTP verification
        sessionStorage.setItem('otp_userId', response.userId);
        sessionStorage.setItem('otp_userEmail', username);
        return response; // Return OTP response to trigger verification flow
      }

      if (response.token) {
        // Store the token in localStorage with both keys for compatibility
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem('tindigwa_token', response.token); // Backup key for compatibility
        
        // Extract user info from JWT token
        const tokenData = this.decodeToken(response.token);
        
        if (tokenData) {
          // Create user info object from JWT claims
          const userInfo = {
            userId: tokenData.userId,
            username: tokenData.sub, // JWT subject is the email/username
            firstName: tokenData.firstName || '',
            lastName: tokenData.lastName || '',
            fullName: tokenData.fullName || '',
            email: tokenData.sub || username,
            role: tokenData.role || 'user',
            branch: response.user?.branch || 'Main',
            phoneNumber: response.user?.phoneNumber || '',
            profilePicture: response.user?.profilePicture || null,
            permissions: response.user?.permissions || [],
            status: response.user?.status || 'active',
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
          localStorage.setItem(this.USERNAME_KEY, userInfo.username);
          
          console.log('✅ User info extracted from JWT and stored:', userInfo);
        } else {
          // Fallback if token decoding fails
          const minimalUserInfo = {
            username: username,
            loginTime: new Date().toISOString()
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(minimalUserInfo));
          localStorage.setItem(this.USERNAME_KEY, username);
          console.warn('⚠️ Could not decode JWT token, stored minimal user info');
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
    localStorage.removeItem('tindigwa_token'); // Remove backup key too
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem('tindigwa_setup_complete'); // Clear setup flag if needed
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

  // Get user's full name
  getUserFullName() {
    const user = this.getCurrentUser();
    if (!user) return 'Unknown User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return user.username || 'Unknown User';
  }

  // Get user's first name
  getUserFirstName() {
    const user = this.getCurrentUser();
    return user?.firstName || user?.username || 'User';
  }

  // Get username (for backward compatibility)
  getUsername() {
    const user = this.getCurrentUser();
    return user?.username || localStorage.getItem(this.USERNAME_KEY) || 'system';
  }

  // Get user's role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || 'user';
  }

  // Get user's branch
  getUserBranch() {
    const user = this.getCurrentUser();
    return user?.branch || 'Main';
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Get user full name by user ID from stored user data
  getUserFullNameById(userId) {
    if (!userId) return '-';
    
    const currentUser = this.getCurrentUser();
    
    // If the user ID matches the current logged-in user, return their name
    if (currentUser && currentUser.userId === userId) {
      return this.getUserFullName();
    }
    
    // For other users, we don't have their data in token
    // So we just return a placeholder or the ID
    // In a real app, you might want to cache user data or make an API call
    return `User ${userId}`;
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

  // Refresh user info from current JWT token (useful after updates)
  refreshUserInfoFromToken() {
    const token = this.getToken();
    if (!token) return false;

    const tokenData = this.decodeToken(token);
    if (!tokenData) return false;

    const currentUser = this.getCurrentUser();
    const userInfo = {
      userId: tokenData.userId,
      username: tokenData.sub,
      firstName: tokenData.firstName || '',
      lastName: tokenData.lastName || '',
      fullName: tokenData.fullName || '',
      email: tokenData.sub,
      role: tokenData.role || 'user',
      branch: currentUser?.branch || 'Main',
      phoneNumber: currentUser?.phoneNumber || '',
      profilePicture: currentUser?.profilePicture || null,
      permissions: currentUser?.permissions || [],
      status: currentUser?.status || 'active',
      loginTime: currentUser?.loginTime || new Date().toISOString()
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    localStorage.setItem(this.USERNAME_KEY, userInfo.username);
    console.log('✅ User info refreshed from JWT token:', userInfo);
    return true;
  }

  // Verify OTP code for 2FA
  async verifyOtp(userId, otpCode) {
    try {
      const response = await ApiService.post('/auth/verify-otp', {
        userId,
        otpCode
      });

      if (response.token) {
        // Store the token
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem('tindigwa_token', response.token);
        
        // Extract user info from JWT token
        const tokenData = this.decodeToken(response.token);
        
        if (tokenData) {
          const userInfo = {
            userId: tokenData.userId,
            username: tokenData.sub,
            firstName: tokenData.firstName || '',
            lastName: tokenData.lastName || '',
            fullName: tokenData.fullName || '',
            email: tokenData.sub,
            role: tokenData.role || 'user',
            branch: tokenData.branch || 'Main',
            phoneNumber: tokenData.phoneNumber || '',
            profilePicture: null,
            permissions: [],
            status: 'active',
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
          localStorage.setItem(this.USERNAME_KEY, userInfo.username);
          
          console.log('✅ OTP verified, user logged in:', userInfo);
        }

        return response;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  // Resend OTP code
  async resendOtp(userId) {
    try {
      const response = await ApiService.post('/auth/resend-otp', {
        userId
      });
      return response;
    } catch (error) {
      console.error('Resend OTP failed:', error);
      throw error;
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthService();
