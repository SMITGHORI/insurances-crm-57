
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRowProps {
  /** The branch of the record */
  recordBranch: string;
  /** The module being accessed */
  module: string;
  /** Children to render if authorized */
  children: React.ReactNode;
  /** Whether to perform branch checking */
  branchCheck?: boolean;
}

/**
 * ProtectedRow component for table row-level access control
 * Hides entire rows based on branch permissions
 */
export const ProtectedRow: React.FC<ProtectedRowProps> = ({
  recordBranch,
  module,
  children,
  branchCheck = true
}) => {
  const { hasPermission, isSameBranch } = usePermissions();

  // Check basic module access
  const hasModuleAccess = hasPermission(module, 'view');
  
  // Check branch access if enabled
  const hasBranchAccess = !branchCheck || isSameBranch(recordBranch);

  // Hide row if user doesn't have access
  if (!hasModuleAccess || !hasBranchAccess) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRow;
