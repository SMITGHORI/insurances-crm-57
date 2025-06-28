
import { User, JWTPayload } from '@/types/auth';

// Mock user data for demo purposes
const DEMO_USERS = {
  'admin@ambainsurance.com': {
    id: '1',
    email: 'admin@ambainsurance.com',
    name: 'Super Admin',
    role: 'super_admin',
    permissions: [
      { module: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'policies', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'claims', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { module: 'agents', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'settings', actions: ['view', 'edit'] }
    ],
    flatPermissions: [
      'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
      'policies:view', 'policies:create', 'policies:edit', 'policies:delete',
      'claims:view', 'claims:create', 'claims:edit', 'claims:delete',
      'quotations:view', 'quotations:create', 'quotations:edit', 'quotations:delete', 'quotations:approve',
      'agents:view', 'agents:create', 'agents:edit', 'agents:delete',
      'settings:view', 'settings:edit'
    ],
    branch: 'main',
    lastUpdated: new Date(),
  },
  'agent@ambainsurance.com': {
    id: '2',
    email: 'agent@ambainsurance.com',
    name: 'Insurance Agent',
    role: 'agent',
    permissions: [
      { module: 'clients', actions: ['view', 'create', 'edit'] },
      { module: 'policies', actions: ['view', 'create', 'edit'] },
      { module: 'claims', actions: ['view', 'create'] },
      { module: 'quotations', actions: ['view', 'create', 'edit'] }
    ],
    flatPermissions: [
      'clients:view', 'clients:create', 'clients:edit',
      'policies:view', 'policies:create', 'policies:edit',
      'claims:view', 'claims:create',
      'quotations:view', 'quotations:create', 'quotations:edit'
    ],
    branch: 'main',
    lastUpdated: new Date(),
  }
};

const DEMO_PASSWORDS = {
  'admin@ambainsurance.com': 'admin123',
  'agent@ambainsurance.com': 'agent123'
};

class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if this is a demo credential
      if (DEMO_USERS[email as keyof typeof DEMO_USERS] && DEMO_PASSWORDS[email as keyof typeof DEMO_PASSWORDS] === password) {
        // Mock JWT token for demo
        const mockToken = btoa(JSON.stringify({
          userId: DEMO_USERS[email as keyof typeof DEMO_USERS].id,
          email: email,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('demoUser', JSON.stringify(DEMO_USERS[email as keyof typeof DEMO_USERS]));
        
        return { success: true };
      }

      // If not demo credentials, try the actual API (if available)
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, error: errorData.message || 'Invalid credentials' };
        }

        const { token, user } = await response.json();
        
        // Store token
        localStorage.setItem('authToken', token);
        
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials. Please try the demo credentials.' };
    } catch (error) {
      console.error('Login failed:', error);
      
      // If API is not available, check demo credentials as fallback
      if (DEMO_USERS[email as keyof typeof DEMO_USERS] && DEMO_PASSWORDS[email as keyof typeof DEMO_PASSWORDS] === password) {
        const mockToken = btoa(JSON.stringify({
          userId: DEMO_USERS[email as keyof typeof DEMO_USERS].id,
          email: email,
          exp: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('demoUser', JSON.stringify(DEMO_USERS[email as keyof typeof DEMO_USERS]));
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials. Please try the demo credentials.' };
    }
  }

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Check if we have a demo user stored
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser);
      }

      // Try to fetch from API
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Ensure the user object has all required properties
        const user: User = {
          id: userData.data.id,
          email: userData.data.email,
          name: userData.data.name,
          role: userData.data.role,
          permissions: userData.data.permissions || [],
          flatPermissions: userData.data.flatPermissions || [],
          branch: userData.data.branch,
          lastUpdated: userData.data.lastUpdated ? new Date(userData.data.lastUpdated) : new Date(),
        };

        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      
      // If API fails, try to use demo user data
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser);
      }
      
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('demoUser');
  }
}

export const authService = AuthService.getInstance();
