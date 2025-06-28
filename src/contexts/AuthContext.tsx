
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const wsConnection = useRef<WebSocket | null>(null);

  /**
   * Initialize WebSocket connection for real-time permission updates
   */
  const initializeWebSocket = useCallback((userId: string) => {
    const wsUrl = `${process.env.VITE_WS_URL || 'ws://localhost:3001'}/realtime`;
    
    try {
      wsConnection.current = new WebSocket(wsUrl);
      
      wsConnection.current.onopen = () => {
        console.log('WebSocket connected for real-time permissions');
        // Subscribe to user-specific permission updates
        wsConnection.current?.send(JSON.stringify({
          type: 'SUBSCRIBE',
          channel: `permissions-updated:${userId}`
        }));
      };
      
      wsConnection.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'PERMISSION_UPDATE' && data.userId === userId) {
            console.log('Permissions updated, refreshing user data...');
            await refreshPermissions();
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };
      
      wsConnection.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsConnection.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (userId) {
            initializeWebSocket(userId);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, []);

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await authService.fetchCurrentUser();
        
        if (userData) {
          setUser(userData);
          // Only initialize WebSocket if we have a real backend connection
          if (process.env.VITE_WS_URL) {
            initializeWebSocket(userData.id);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('demoUser');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup WebSocket on unmount
    return () => {
      if (wsConnection.current) {
        wsConnection.current.close();
        wsConnection.current = null;
      }
    };
  }, [initializeWebSocket]);

  /**
   * Enhanced login with backend integration and demo support
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const result = await authService.login(email, password);
      
      if (result.success) {
        const userData = await authService.fetchCurrentUser();
        
        if (userData) {
          setUser(userData);
          // Only initialize WebSocket if we have a real backend connection
          if (process.env.VITE_WS_URL) {
            initializeWebSocket(userData.id);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enhanced logout with cleanup
   */
  const logout = useCallback(() => {
    // Close WebSocket connection
    if (wsConnection.current) {
      wsConnection.current.close();
      wsConnection.current = null;
    }
    
    // Clear stored data
    authService.logout();
    
    // Clear user state
    setUser(null);
  }, []);

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = async () => {
    try {
      const userData = await authService.fetchCurrentUser();
      
      if (userData) {
        setUser(userData);
      } else {
        // Token expired or invalid, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      logout();
    }
  };

  /**
   * Check if user has specific permission using flatPermissions
   */
  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.flatPermissions) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check if permission exists in flatPermissions array
    const permissionString = `${module}:${action}`;
    return user.flatPermissions.includes(permissionString);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.flatPermissions) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return permissions.some(permission => {
      const [module, action] = permission.split(':');
      return hasPermission(module, action);
    });
  };

  /**
   * Check if record belongs to same branch as user
   */
  const isSameBranch = (recordBranch: string): boolean => {
    if (!user) return false;
    
    // Super admin can access all branches
    if (user.role === 'super_admin') return true;
    
    // Check if user's branch matches record branch
    return user.branch === recordBranch || recordBranch === 'all';
  };

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    refreshPermissions,
    hasPermission,
    hasAnyPermission,
    isSameBranch,
    isSuperAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
