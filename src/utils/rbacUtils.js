
/**
 * Role-Based Access Control Utilities
 * Centralized permission checking logic
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent'
};

export const MODULES = {
  CLIENTS: 'clients',
  POLICIES: 'policies',
  CLAIMS: 'claims',
  LEADS: 'leads',
  QUOTATIONS: 'quotations',
  OFFERS: 'offers',
  INVOICES: 'invoices',
  AGENTS: 'agents',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  ACTIVITIES: 'activities'
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  APPROVE: 'approve',
  EDIT_SENSITIVE: 'edit_sensitive',
  EDIT_STATUS: 'edit_status'
};

/**
 * Default role permissions configuration
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: 'ALL', // Super admin has all permissions
  
  [ROLES.ADMIN]: [
    { module: MODULES.CLIENTS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.POLICIES, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
    { module: MODULES.CLAIMS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
    { module: MODULES.LEADS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.QUOTATIONS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.OFFERS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.INVOICES, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.AGENTS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.REPORTS, actions: [ACTIONS.VIEW, ACTIONS.EXPORT] },
    { module: MODULES.SETTINGS, actions: [ACTIONS.VIEW, ACTIONS.EDIT] },
    { module: MODULES.ACTIVITIES, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE] }
  ],
  
  [ROLES.MANAGER]: [
    { module: MODULES.CLIENTS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.POLICIES, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.APPROVE, ACTIONS.EXPORT] },
    { module: MODULES.CLAIMS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.APPROVE, ACTIONS.EXPORT] },
    { module: MODULES.LEADS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.QUOTATIONS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT] },
    { module: MODULES.OFFERS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT] },
    { module: MODULES.REPORTS, actions: [ACTIONS.VIEW, ACTIONS.EXPORT] },
    { module: MODULES.SETTINGS, actions: [ACTIONS.VIEW] },
    { module: MODULES.ACTIVITIES, actions: [ACTIONS.VIEW, ACTIONS.CREATE] }
  ],
  
  [ROLES.AGENT]: [
    { module: MODULES.CLIENTS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT] },
    { module: MODULES.POLICIES, actions: [ACTIONS.VIEW, ACTIONS.CREATE] },
    { module: MODULES.CLAIMS, actions: [ACTIONS.VIEW, ACTIONS.CREATE] },
    { module: MODULES.LEADS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT] },
    { module: MODULES.QUOTATIONS, actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT] },
    { module: MODULES.OFFERS, actions: [ACTIONS.VIEW] },
    { module: MODULES.SETTINGS, actions: [ACTIONS.VIEW] },
    { module: MODULES.ACTIVITIES, actions: [ACTIONS.VIEW] }
  ]
};

/**
 * Check if a user has a specific permission
 */
export const checkPermission = (user, module, action) => {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  // Check flat permissions first (optimized)
  if (user.flatPermissions?.includes(`${module}:${action}`)) {
    return true;
  }

  // Fallback to structured permissions
  const modulePermissions = user.permissions?.find(p => p.module === module);
  return modulePermissions ? modulePermissions.actions.includes(action) : false;
};

/**
 * Check if a user has any of the specified permissions
 */
export const checkAnyPermission = (user, permissionList) => {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  return permissionList.some(permission => {
    if (typeof permission === 'string') {
      return user.flatPermissions?.includes(permission);
    }
    if (permission.module && permission.action) {
      return checkPermission(user, permission.module, permission.action);
    }
    return false;
  });
};

/**
 * Check if a user can access a record based on branch
 */
export const checkBranchAccess = (user, recordBranch) => {
  if (!user || !recordBranch) return true;
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) return true;
  return user.branch === recordBranch;
};

/**
 * Get filtered data based on user's branch access
 */
export const filterDataByBranch = (user, data, branchField = 'branch') => {
  if (!user || !data) return data;
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) return data;
  
  return data.filter(item => item[branchField] === user.branch);
};

/**
 * Generate permission matrix for UI display
 */
export const generatePermissionMatrix = (modules, actions) => {
  const matrix = {};
  
  Object.keys(modules).forEach(moduleKey => {
    matrix[moduleKey] = {};
    actions.forEach(action => {
      matrix[moduleKey][action] = false;
    });
  });
  
  return matrix;
};

/**
 * Update permission matrix with user's actual permissions
 */
export const populatePermissionMatrix = (user, matrix) => {
  if (!user || !user.permissions) return matrix;
  
  const updatedMatrix = { ...matrix };
  
  user.permissions.forEach(permission => {
    if (updatedMatrix[permission.module]) {
      permission.actions.forEach(action => {
        if (updatedMatrix[permission.module][action] !== undefined) {
          updatedMatrix[permission.module][action] = true;
        }
      });
    }
  });
  
  return updatedMatrix;
};

export default {
  ROLES,
  MODULES,
  ACTIONS,
  DEFAULT_ROLE_PERMISSIONS,
  checkPermission,
  checkAnyPermission,
  checkBranchAccess,
  filterDataByBranch,
  generatePermissionMatrix,
  populatePermissionMatrix
};
