
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { user, hasPermission, hasAnyPermission, isSameBranch, isSuperAdmin, isAgent } = useAuth();

  const value = {
    user,
    hasPermission,
    hasAnyPermission,
    isSameBranch,
    isSuperAdmin,
    isAgent, // Add this line
    isAuthenticated: !!user
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
