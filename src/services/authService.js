
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, apiRequest } from '../config/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthService login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  async fetchCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Verify token is not expired
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 <= Date.now()) {
          localStorage.removeItem('authToken');
          return null;
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        return null;
      }

      const response = await apiRequest('/auth/me');
      return this.transformUserData(response.data);
    } catch (error) {
      console.error('Fetch current user error:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  }



  transformUserData(userData) {
    return {
      id: userData._id || userData.id,
      email: userData.email,
      name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
      role: userData.role?.name || userData.role,
      branch: userData.branch || 'main',
      permissions: userData.permissions || [],
      flatPermissions: userData.flatPermissions || []
    };
  }

  async refreshPermissions() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await apiRequest('/auth/refresh-permissions');
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        return this.fetchCurrentUser();
      }
      return null;
    } catch (error) {
      console.error('Refresh permissions error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
