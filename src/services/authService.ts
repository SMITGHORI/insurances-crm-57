
import { User, JWTPayload } from '@/types/auth';

class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Get API URL with fallback
  private getApiUrl(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AuthService login with API URL:', this.getApiUrl());
      
      const response = await fetch(`${this.getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthService login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        return { success: false, error: errorMessage };
      }

      const { token, user } = await response.json();
      
      // Store token
      localStorage.setItem('authToken', token);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await fetch(`${this.getApiUrl()}/api/users/me`, {
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
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}

export const authService = AuthService.getInstance();
