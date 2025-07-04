
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            branch: decoded.branch,
            permissions: decoded.permissions || [],
            flatPermissions: decoded.flatPermissions || []
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          branch: decoded.branch,
          permissions: decoded.permissions || [],
          flatPermissions: decoded.flatPermissions || []
        });

        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshPermissions = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
      const response = await fetch('/api/auth/refresh-permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
