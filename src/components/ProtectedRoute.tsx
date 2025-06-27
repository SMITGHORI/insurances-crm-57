
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  /** Children to render when authenticated and authorized */
  children: ReactNode;
  /** Required module permission (optional - if not provided, only checks authentication) */
  module?: string;
  /** Required action permission (optional - if not provided, only checks authentication) */
  action?: string;
  /** Whether to perform branch checking */
  branchCheck?: boolean;
  /** Record branch for branch-based access control */
  recordBranch?: string;
  /** Redirect path when access is denied (default: '/auth') */
  redirectTo?: string;
}

/**
 * ProtectedRoute component that handles both authentication and authorization
 * Redirects to auth page if not authenticated or to dashboard if not authorized
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  module,
  action,
  branchCheck = true,
  recordBranch,
  redirectTo = '/auth'
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isSameBranch } = usePermissions();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If module and action are specified, check permissions
  if (module && action) {
    const hasRequiredPermission = hasPermission(module, action);
    const hasBranchAccess = !branchCheck || !recordBranch || isSameBranch(recordBranch);

    // Redirect to dashboard if not authorized
    if (!hasRequiredPermission || !hasBranchAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
