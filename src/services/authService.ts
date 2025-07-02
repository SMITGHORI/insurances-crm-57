
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
      console.error('Login failed:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  }

  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token found');
        return null;
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

      // Fallback: Fetch user data from backend API
      console.log('Fetching user data from backend...');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      localStorage.removeItem('currentUser');
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
}

export const authService = AuthService.getInstance();
