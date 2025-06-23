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

// Define permissions for different roles
const ROLE_PERMISSIONS = {
  super_admin: {
    // Dashboard permissions
    viewDashboard: true,
    viewFullAnalytics: true,
    viewAllAgentMetrics: true,
    
    // Clients permissions - Full access
    viewAllClients: true,
    createClient: true,
    editAnyClient: true,
    editClientCriticalFields: true,
    deleteClient: true,
    viewClientFinancials: true,
    assignClientsToAgents: true,
    transferClientOwnership: true,
    
    // Agents permissions
    viewAllAgents: true,
    createAgent: true,
    editAgent: true,
    deleteAgent: true,
    manageAgentStatus: true,
    viewAgentCommissions: true,
    
    // Policies permissions
    viewAllPolicies: true,
    createPolicy: true,
    editAnyPolicy: true,
    deletePolicy: true,
    approvePolicies: true,
    viewAllCommissions: true,
    
    // Claims permissions
    viewAllClaims: true,
    createClaim: true,
    editAnyClaim: true,
    deleteClaim: true,
    approveClaims: true,
    processPayments: true,
    
    // Leads permissions
    viewAllLeads: true,
    createLead: true,
    editAnyLead: true,
    deleteLead: true,
    assignLeads: true,
    
    // Quotations permissions
    viewAllQuotations: true,
    createQuotation: true,
    editAnyQuotation: true,
    deleteQuotation: true,
    
    // Invoices permissions
    viewAllInvoices: true,
    createInvoice: true,
    editAnyInvoice: true,
    deleteInvoice: true,
    
    // Settings permissions
    manageSettings: true,
    viewSystemLogs: true,
    manageUsers: true,
    configureSystem: true,
  },
  
  manager: {
    // Dashboard permissions
    viewDashboard: true,
    viewFullAnalytics: true,
    viewAllAgentMetrics: true,
    
    // Clients permissions - Most access except deletion
    viewAllClients: true,
    createClient: true,
    editAnyClient: true,
    editClientCriticalFields: true,
    deleteClient: false,
    viewClientFinancials: true,
    assignClientsToAgents: true,
    transferClientOwnership: true,
    
    // Agents permissions
    viewAllAgents: true,
    createAgent: true,
    editAgent: true,
    deleteAgent: true,
    manageAgentStatus: true,
    viewAgentCommissions: true,
    
    // Policies permissions
    viewAllPolicies: true,
    createPolicy: true,
    editAnyPolicy: true,
    deletePolicy: true,
    approvePolicies: true,
    viewAllCommissions: true,
    
    // Claims permissions
    viewAllClaims: true,
    createClaim: true,
    editAnyClaim: true,
    deleteClaim: true,
    approveClaims: true,
    processPayments: true,
    
    // Leads permissions
    viewAllLeads: true,
    createLead: true,
    editAnyLead: true,
    deleteLead: true,
    assignLeads: true,
    
    // Quotations permissions
    viewAllQuotations: true,
    createQuotation: true,
    editAnyQuotation: true,
    deleteQuotation: true,
    
    // Invoices permissions
    viewAllInvoices: true,
    createInvoice: true,
    editAnyInvoice: true,
    deleteInvoice: true,
    
    // Settings permissions
    manageSettings: true,
    viewSystemLogs: true,
    manageUsers: true,
    configureSystem: true,
  },
  
  agent: {
    // Dashboard permissions - limited view
    viewDashboard: true,
    viewFullAnalytics: false,
    viewAllAgentMetrics: false,
    
    // Clients permissions - Restricted to assigned clients
    viewAllClients: false,
    createClient: true,
    editAnyClient: false,
    editClientCriticalFields: false,
    deleteClient: false,
    viewClientFinancials: false,
    transferClientOwnership: false,
    
    // Agent-specific client permissions
    viewAssignedClients: true,
    editAssignedClients: true,
    editClientBasicFields: true,
    uploadClientDocuments: true,
    viewClientDocuments: true,
    
    // Agents permissions - very limited
    viewAllAgents: false,
    createAgent: false,
    editAgent: false,
    deleteAgent: false,
    manageAgentStatus: false,
    viewAgentCommissions: false, // Only own commissions
    assignClientsToAgents: false,
    
    // Policies permissions - only assigned policies
    viewAllPolicies: false,
    createPolicy: true,
    editAnyPolicy: false,
    deletePolicy: false,
    approvePolicies: false,
    viewAllCommissions: false,
    
    // Claims permissions - only assigned claims
    viewAllClaims: false,
    createClaim: true,
    editAnyClaim: false,
    deleteClaim: false,
    approveClaims: false,
    processPayments: false,
    
    // Leads permissions - only assigned leads
    viewAllLeads: false,
    createLead: true,
    editAnyLead: false,
    deleteLead: false,
    assignLeads: false,
    
    // Quotations permissions - only own quotations
    viewAllQuotations: false,
    createQuotation: true,
    editAnyQuotation: false,
    deleteQuotation: false,
    
    // Invoices permissions - limited
    viewAllInvoices: false,
    createInvoice: false,
    editAnyInvoice: false,
    deleteInvoice: false,
    
    // Settings permissions - personal only
    manageSettings: false,
    viewSystemLogs: false,
    manageUsers: false,
    configureSystem: false,
  }
};

export const PermissionsProvider = ({ children }) => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions ? rolePermissions[permission] : false;
  };

  const canAccessRoute = (route) => {
    const routePermissions = {
      '/dashboard': hasPermission('viewDashboard'),
      '/clients': hasPermission('viewAllClients') || hasPermission('viewAssignedClients'),
      '/agents': hasPermission('viewAllAgents'),
      '/policies': hasPermission('viewAllPolicies') || user?.role === 'agent',
      '/claims': hasPermission('viewAllClaims') || user?.role === 'agent',
      '/leads': hasPermission('viewAllLeads') || user?.role === 'agent',
      '/quotations': hasPermission('viewAllQuotations') || user?.role === 'agent',
      '/invoices': hasPermission('viewAllInvoices'),
      '/settings': hasPermission('manageSettings') || user?.role === 'agent',
      '/recent-activities': hasPermission('viewDashboard'),
    };
    
    return routePermissions[route] !== false;
  };

  const isAgent = () => user?.role === 'agent';
  const isSuperAdmin = () => user?.role === 'super_admin';
  const isManager = () => user?.role === 'manager';

  const getFilteredData = (data, entityType) => {
    if (isSuperAdmin() || isManager()) return data;
    
    // For agents, filter data to show only their assigned items
    if (isAgent() && Array.isArray(data)) {
      const agentId = user.id;
      return data.filter(item => {
        switch (entityType) {
          case 'clients':
            return item.agentId === agentId || item.assignedAgent === agentId || item.assignedAgentId === agentId;
          case 'policies':
            return item.agentId === agentId || item.assignedAgent === agentId;
          case 'claims':
            return item.agentId === agentId || item.assignedAgent === agentId;
          case 'leads':
            return item.agentId === agentId || item.assignedAgent === agentId;
          case 'quotations':
            return item.agentId === agentId || item.createdBy === agentId;
          case 'invoices':
            return item.agentId === agentId || item.createdBy === agentId;
          default:
            return false;
        }
      });
    }
    
    return data;
  };

  // Client-specific permission checks
  const canEditClient = (client) => {
    if (hasPermission('editAnyClient')) return true;
    if (hasPermission('editAssignedClients') && client.assignedAgentId === user.id) return true;
    return false;
  };

  const canDeleteClient = (client) => {
    return hasPermission('deleteClient');
  };

  const canViewClient = (client) => {
    if (hasPermission('viewAllClients')) return true;
    if (hasPermission('viewAssignedClients') && client.assignedAgentId === user.id) return true;
    return false;
  };

  const value = {
    hasPermission,
    canAccessRoute,
    isAgent,
    isSuperAdmin,
    isManager,
    getFilteredData,
    canEditClient,
    canDeleteClient,
    canViewClient,
    userRole: user?.role,
    userId: user?.id,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
