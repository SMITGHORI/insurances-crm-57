
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Handle permission updates from WebSocket or token refresh
   */
  const handlePermissionUpdate = useCallback((updatedUser: User | null) => {
    if (!updatedUser) {
      // Force logout due to permission revocation
      logout();
      return;
    }

    setUser(updatedUser);
    
    // Update localStorage with new permissions
    if (updatedUser) {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        authService.storeUserData(updatedUser, currentToken);
      }
    }
  }, []);

  /**
   * Initialize user from stored data and set up permission sync
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = authService.getStoredUserData();

        if (token && storedUser) {
          // Verify token is still valid
          const decodedUser = authService.decodeJWT(token);
          
          if (decodedUser) {
            setUser(decodedUser);
            // Initialize real-time permission sync
            authService.initializePermissionSync(decodedUser.id, handlePermissionUpdate);
          } else {
            // Token expired, clear stored data
            authService.clearUserData();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.clearUserData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup WebSocket on unmount
    return () => {
      authService.closePermissionSync();
    };
  }, [handlePermissionUpdate]);

  /**
   * Enhanced login with JWT decoding and permission extraction
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // In production, this would be an API call to your authentication endpoint
      const token = authService.createMockJWT(email, password);
      
      if (!token) {
        return { success: false, error: 'Invalid credentials' };
      }

      const userData = authService.decodeJWT(token);
      
      if (!userData) {
        return { success: false, error: 'Failed to decode user data' };
      }

      // Store user data and token
      authService.storeUserData(userData, token);
      setUser(userData);

      // Initialize real-time permission sync
      authService.initializePermissionSync(userData.id, handlePermissionUpdate);

      return { success: true };
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
    authService.closePermissionSync();
    
    // Clear all stored data
    authService.clearUserData();
    
    // Clear user state
    setUser(null);
  }, []);

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !user) return;

      // In production, make API call to refresh token/permissions
      const refreshedUser = authService.decodeJWT(token);
      
      if (refreshedUser) {
        setUser(refreshedUser);
        authService.storeUserData(refreshedUser, token);
      } else {
        // Token expired, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      logout();
    }
  };

  /**
   * Check if user has specific permission
   */
  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    const modulePermissions = user.permissions.find(p => p.module === module);
    return modulePermissions ? modulePermissions.actions.includes(action) : false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (actions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return actions.some(action => {
      const [module, actionName] = action.split(':');
      return hasPermission(module, actionName);
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
