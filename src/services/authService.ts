
import { User, JWTPayload } from '@/types/auth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Make API request to backend
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Invalid credentials' };
      }

      // Store authentication token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  }

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Fetch user data from backend API
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If token is invalid, clear it
        if (response.status === 401) {
          this.logout();
        }
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
        branch: userData.data.branch || 'main',
        lastUpdated: userData.data.lastUpdated ? new Date(userData.data.lastUpdated) : new Date(),
      };

      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Call backend logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
}

export const authService = AuthService.getInstance();
