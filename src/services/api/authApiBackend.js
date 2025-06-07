
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

/**
 * Backend API service for authentication operations
 */
class AuthBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/auth`;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Auth API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await this.request('/logout', {
      method: 'POST',
    });
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const response = await this.request('/me');
    return response.data;
  }

  /**
   * Refresh user session
   */
  async refreshSession() {
    const response = await this.request('/refresh', {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  }

  /**
   * Get stored auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}

// Export singleton instance
export const authBackendApi = new AuthBackendApiService();
export default authBackendApi;
