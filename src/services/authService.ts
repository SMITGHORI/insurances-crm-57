
import { User, JWTPayload, Permission } from '@/types/auth';

export class AuthService {
  private static instance: AuthService;
  private wsConnection: WebSocket | null = null;
  private permissionUpdateCallbacks: ((user: User | null) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Decode JWT token to extract user data and permissions
   */
  decodeJWT(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload: JWTPayload = JSON.parse(jsonPayload);

      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        console.warn('JWT token has expired');
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        permissions: payload.permissions || [],
        branch: payload.branch || 'main',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * Mock JWT creation for development (replace with real backend integration)
   */
  createMockJWT(email: string, password: string): string | null {
    // Development mock - replace with actual API call
    const mockUsers = {
      'admin@ambainsurance.com': {
        id: '1',
        email: 'admin@ambainsurance.com',
        name: 'Admin User',
        role: 'super_admin',
        permissions: [
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'assign'] },
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'transfer'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'process'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'send'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'send'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'edit', 'manage'] }
        ],
        branch: 'headquarters'
      },
      'agent@ambainsurance.com': {
        id: '2',
        email: 'agent@ambainsurance.com',
        name: 'Agent User',
        role: 'agent',
        permissions: [
          { module: 'leads', actions: ['view', 'create', 'edit'] },
          { module: 'clients', actions: ['view', 'create', 'edit'] },
          { module: 'policies', actions: ['view', 'create', 'edit'] },
          { module: 'claims', actions: ['view', 'create', 'edit'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'send'] },
          { module: 'reports', actions: ['view'] },
          { module: 'settings', actions: ['view'] }
        ],
        branch: 'mumbai'
      }
    };

    const userData = mockUsers[email as keyof typeof mockUsers];
    if (!userData || password !== (email.includes('admin') ? 'admin123' : 'agent123')) {
      return null;
    }

    // Create mock JWT payload
    const payload = {
      sub: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      branch: userData.branch,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // In production, this would be signed by your backend
    return btoa(JSON.stringify({ header: 'mock' })) + '.' + 
           btoa(JSON.stringify(payload)) + '.' + 
           btoa('mock-signature');
  }

  /**
   * Initialize WebSocket connection for real-time permission updates
   */
  initializePermissionSync(userId: string, onUpdate: (user: User | null) => void): void {
    // Mock WebSocket URL - replace with your actual WebSocket endpoint
    const wsUrl = `${process.env.VITE_WS_URL || 'ws://localhost:3001'}/permissions/${userId}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Permission sync WebSocket connected');
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'PERMISSION_UPDATE') {
            const token = localStorage.getItem('authToken');
            if (token) {
              const updatedUser = this.decodeJWT(data.token || token);
              onUpdate(updatedUser);
            }
          } else if (data.type === 'FORCE_LOGOUT') {
            console.warn('Force logout due to permission revocation');
            onUpdate(null);
          }
        } catch (error) {
          console.error('Failed to process permission update:', error);
        }
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('Permission sync WebSocket error:', error);
      };
      
      this.wsConnection.onclose = () => {
        console.log('Permission sync WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (userId) {
            this.initializePermissionSync(userId, onUpdate);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to initialize permission sync:', error);
    }
  }

  /**
   * Close WebSocket connection
   */
  closePermissionSync(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Store user data in localStorage
   */
  storeUserData(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
    localStorage.setItem('userBranch', user.branch);
  }

  /**
   * Clear user data from localStorage
   */
  clearUserData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('userBranch');
  }

  /**
   * Retrieve stored user data
   */
  getStoredUserData(): User | null {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve stored user data:', error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();
