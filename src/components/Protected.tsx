
import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Props interface for the Protected component
 */
export interface ProtectedProps {
  /** The module to check permission for (e.g., 'policies', 'clients') */
  module: string;
  /** The action to check permission for (e.g., 'create', 'edit', 'view') */
  action: string;
  /** Whether to perform branch checking (default: true) */
  branchCheck?: boolean;
  /** Fallback component to render when access is denied */
  fallback?: ReactNode;
  /** The branch of the record being accessed (for branch checking) */
  recordBranch?: string;
  /** Children to render when access is granted */
  children: ReactNode;
}

/**
 * Protected component that conditionally renders children based on user permissions
 * 
 * Usage:
 * <Protected module="policies" action="create">
 *   <CreatePolicyButton />
 * </Protected>
 * 
 * <Protected module="clients" action="edit" recordBranch={client.branch}>
 *   <EditClientButton />
 * </Protected>
 */
export const Protected: React.FC<ProtectedProps> = ({
  module,
  action,
  branchCheck = true,
  fallback = null,
  recordBranch,
  children
}) => {
  const { hasPermission, isSameBranch } = usePermissions();

  // Check if user has the required permission
  const hasRequiredPermission = hasPermission(module, action);

  // Check branch access if branchCheck is enabled and recordBranch is provided
  const hasBranchAccess = !branchCheck || !recordBranch || isSameBranch(recordBranch);

  // Render children only if both permission and branch checks pass
  if (hasRequiredPermission && hasBranchAccess) {
    return <>{children}</>;
  }

  // Render fallback or null when access is denied
  return <>{fallback}</>;
};

export default Protected;
