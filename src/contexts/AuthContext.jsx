import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Initializing auth with token:', !!token);
        
        if (token) {
          try {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded);
            
            if (decoded.exp * 1000 > Date.now()) {
              const userData = {
                id: decoded.sub || decoded.userId,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
                branch: decoded.branch,
                permissions: decoded.permissions || [],
                flatPermissions: decoded.flatPermissions || []
              };
              console.log('Setting user from token:', userData);
              setUser(userData);
            } else {
              console.log('Token expired, clearing storage');
              localStorage.removeItem('authToken');
            }
          } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('authToken');
          }
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        console.log('Auth initialization completed');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      setLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success && data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        
        const decoded = jwtDecode(data.data.token);
        const userData = transformUserData(data.data.user);
        
        setUser(userData);
        console.log('Backend login successful');
        return { success: true };
      } else {
        console.log('Backend login failed:', data.message);
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to transform user data from backend
  const transformUserData = (userData) => {
    return {
      id: userData._id || userData.id,
      email: userData.email,
      name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
      role: userData.role?.name || userData.role,
      branch: userData.branch || 'main',
      permissions: userData.permissions || [],
      flatPermissions: userData.flatPermissions || []
    };
  };

  const logout = async () => {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const refreshPermissions = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !user) return;



    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh-permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          const decoded = jwtDecode(data.token);
          
          setUser(prevUser => ({
            ...prevUser,
            permissions: decoded.permissions || [],
            flatPermissions: decoded.flatPermissions || []
          }));
        }
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    // Check flat permissions first (optimized)
    if (user.flatPermissions?.includes(`${module}:${action}`)) {
      return true;
    }

    // Fallback to structured permissions
    const modulePermissions = user.permissions?.find(p => p.module === module);
    return modulePermissions ? modulePermissions.actions.includes(action) : false;
  };

  const hasAnyPermission = (permissionList) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    return permissionList.some(permission => {
      if (typeof permission === 'string') {
        return user.flatPermissions?.includes(permission);
      }
      if (permission.module && permission.action) {
        return hasPermission(permission.module, permission.action);
      }
      return false;
    });
  };

  const isSameBranch = (recordBranch) => {
    if (!user || !recordBranch) return true;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return user.branch === recordBranch;
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  // Add this new function
  const isAgent = () => {
    return user?.role === 'agent';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshPermissions,
    hasPermission,
    hasAnyPermission,
    isSameBranch,
    isSuperAdmin,
    isAgent, // Add this to the exported value
    isAuthenticated: !!user
  };

  console.log('AuthContext value:', { user: !!user, loading, isAuthenticated: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
