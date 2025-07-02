
import { User, JWTPayload } from '@/types/auth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo credentials for fallback mode
const DEMO_CREDENTIALS = {
  email: 'admin@ambainsurance.com',
  password: 'admin123'
};

// Demo user data
const DEMO_USER = {
  _id: '67742f123456789012345678',
  id: '67742f123456789012345678',
  email: 'admin@ambainsurance.com',
  name: 'Admin User',
  role: { name: 'super_admin' },
  permissions: [],
  flatPermissions: ['*:*'], // Super admin has all permissions
  branch: 'main',
  isActive: true,
  lastUpdated: new Date().toISOString()
};

class AuthService {
  private static instance: AuthService;
  private demoMode: boolean = false;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return true;
    } catch (error) {
      console.log('Backend not available, switching to demo mode');
      return false;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Check if backend is available
      const backendAvailable = await this.checkBackendConnection();
      
      if (!backendAvailable) {
        // Fall back to demo mode
        console.log('Using demo mode authentication');
        return this.demoLogin(email, password);
      }

      // Try backend authentication
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Invalid credentials' };
      }

      // Store authentication token
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        console.log('Token stored successfully');
      }
      
      // Store user data if available
      if (data.data?.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        console.log('User data stored successfully');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Backend login failed, trying demo mode:', error);
      // Fall back to demo mode if backend fails
      return this.demoLogin(email, password);
    }
  }

  private async demoLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check demo credentials
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        this.demoMode = true;
        
        // Create demo token
        const demoToken = btoa(JSON.stringify({
          userId: DEMO_USER.id,
          email: DEMO_USER.email,
          exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }));
        
        // Store demo data
        localStorage.setItem('authToken', demoToken);
        localStorage.setItem('currentUser', JSON.stringify(DEMO_USER));
        localStorage.setItem('demoMode', 'true');
        
        console.log('Demo login successful');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials. Use admin@ambainsurance.com / admin123 for demo.' };
      }
    } catch (error) {
      console.error('Demo login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found');
        return null;
      }

      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      if (isDemoMode) {
        // Return demo user data
        console.log('Using demo user data');
        const user: User = {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          role: DEMO_USER.role.name,
          permissions: DEMO_USER.permissions,
          flatPermissions: DEMO_USER.flatPermissions,
          branch: DEMO_USER.branch,
          lastUpdated: new Date(DEMO_USER.lastUpdated),
        };
        return user;
      }

      // First try to get user from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('Using stored user data:', userData);
          
          // Transform the stored user data to match our User interface
          const user: User = {
            id: userData._id || userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role?.name || userData.role,
            permissions: userData.permissions || [],
            flatPermissions: userData.flatPermissions || [],
            branch: userData.branch || 'main',
            lastUpdated: userData.lastUpdated ? new Date(userData.lastUpdated) : new Date(),
          };
          
          return user;
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
        }
      }

      // Fallback: Try to fetch user data from backend API
      console.log('Fetching user data from backend...');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        console.error('Failed to fetch user data, status:', response.status);
        // If token is invalid, clear it
        if (response.status === 401) {
          this.logout();
        }
        throw new Error('Failed to fetch user data');
      }

      const responseData = await response.json();
      console.log('Backend user response:', responseData);
      
      // Ensure the user object has all required properties
      const user: User = {
        id: responseData.data._id || responseData.data.id,
        email: responseData.data.email,
        name: responseData.data.name,
        role: responseData.data.role?.name || responseData.data.role,
        permissions: responseData.data.permissions || [],
        flatPermissions: responseData.data.flatPermissions || [],
        branch: responseData.data.branch || 'main',
        lastUpdated: responseData.data.lastUpdated ? new Date(responseData.data.lastUpdated) : new Date(),
      };

      // Store updated user data
      localStorage.setItem('currentUser', JSON.stringify(responseData.data));

      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      if (token && !isDemoMode) {
        // Call backend logout endpoint only if not in demo mode
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
        } catch (error) {
          console.log('Backend logout failed (demo mode or network issue):', error);
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('demoMode');
      this.demoMode = false;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
}

export const authService = AuthService.getInstance();
