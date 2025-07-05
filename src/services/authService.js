
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
        localStorage.removeItem('demoMode');
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
      if (token && token !== 'demo-token-admin' && token !== 'demo-token-agent') {
        await apiRequest('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('demoMode');
    }
  }

  async fetchCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Handle demo tokens
      if (token === 'demo-token-admin' || token === 'demo-token-agent') {
        return this.getDemoUser(token);
      }

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

  getDemoUser(token) {
    if (token === 'demo-token-admin') {
      return {
        id: 'admin-fallback-id',
        email: 'admin@gmail.com',
        name: 'Admin User',
        role: 'super_admin',
        branch: 'main',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export', 'edit_sensitive'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_sensitive'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_status'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit', 'export'] }
        ],
        flatPermissions: [
          'clients:view', 'clients:create', 'clients:edit', 'clients:delete', 'clients:export', 'clients:edit_sensitive',
          'leads:view', 'leads:create', 'leads:edit', 'leads:delete', 'leads:export',
          'quotations:view', 'quotations:create', 'quotations:edit', 'quotations:delete', 'quotations:export',
          'policies:view', 'policies:create', 'policies:edit', 'policies:delete', 'policies:approve', 'policies:export', 'policies:edit_sensitive',
          'claims:view', 'claims:create', 'claims:edit', 'claims:delete', 'claims:approve', 'claims:export', 'claims:edit_status',
          'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete', 'invoices:export',
          'agents:view', 'agents:create', 'agents:edit', 'agents:delete', 'agents:export',
          'activities:view', 'activities:create', 'activities:edit', 'activities:delete', 'activities:export',
          'offers:view', 'offers:create', 'offers:edit', 'offers:delete', 'offers:export',
          'reports:view', 'reports:export',
          'settings:view', 'settings:edit', 'settings:export'
        ]
      };
    } else if (token === 'demo-token-agent') {
      return {
        id: 'agent-fallback-id',
        email: 'agent@gmail.com',
        name: 'Test Agent',
        role: 'agent',
        branch: 'branch1',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit'] },
          { module: 'leads', actions: ['view', 'create', 'edit'] },
          { module: 'quotations', actions: ['view', 'create', 'edit'] },
          { module: 'policies', actions: ['view', 'create', 'edit'] },
          { module: 'claims', actions: ['view', 'create', 'edit'] }
        ],
        flatPermissions: [
          'clients:view', 'clients:create', 'clients:edit',
          'leads:view', 'leads:create', 'leads:edit',
          'quotations:view', 'quotations:create', 'quotations:edit',
          'policies:view', 'policies:create', 'policies:edit',
          'claims:view', 'claims:create', 'claims:edit'
        ]
      };
    }
    return null;
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
      if (!token || localStorage.getItem('demoMode')) return null;

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
