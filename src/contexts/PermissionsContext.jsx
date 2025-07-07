
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

  // Function to filter data based on user role and permissions
  const getFilteredData = (data, entityType) => {
    if (!data || !Array.isArray(data)) {
      return data;
    }

    // Super admins see all data
    if (isSuperAdmin()) {
      return data;
    }

    // For agents, filter to show only their assigned data
    if (isAgent() && user) {
      switch (entityType) {
        case 'policies':
          return data.filter(item => 
            item.agentId === user.id || 
            item.assignedAgent === user.id ||
            item.assignedAgentId === user.id
          );
        case 'clients':
          return data.filter(item => 
            item.agentId === user.id || 
            item.assignedAgent === user.id ||
            item.assignedAgentId === user.id
          );
        case 'leads':
          return data.filter(item => 
            item.agentId === user.id || 
            item.assignedAgent === user.id ||
            item.assignedAgentId === user.id
          );
        default:
          return data;
      }
    }

    // For other roles, return all data (can be customized based on specific permissions)
    return data;
  };

  const value = {
    user,
    hasPermission,
    hasAnyPermission,
    isSameBranch,
    isSuperAdmin,
    isAgent,
    getFilteredData,
    isAuthenticated: !!user
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
