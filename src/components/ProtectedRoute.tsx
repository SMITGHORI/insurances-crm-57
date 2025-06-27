
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AccessDenied from './AccessDenied';
import { toast } from 'sonner';

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
  /** Redirect path when access is denied (default: renders AccessDenied component) */
  redirectTo?: string;
  /** Custom access denied message */
  accessDeniedMessage?: string;
}

/**
 * Enhanced ProtectedRoute component that handles authentication, authorization, and loading states
 * Now renders AccessDenied component by default instead of redirecting
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  module,
  action,
  branchCheck = true,
  recordBranch,
  redirectTo,
  accessDeniedMessage
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isSameBranch } = usePermissions();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If module and action are specified, check permissions
  if (module && action) {
    try {
      const hasRequiredPermission = hasPermission(module, action);
      const hasBranchAccess = !branchCheck || !recordBranch || isSameBranch(recordBranch);

      // Handle authorization failure
      if (!hasRequiredPermission || !hasBranchAccess) {
        // Show toast notification for better UX
        if (!hasRequiredPermission) {
          toast.error(`Access denied: You need ${module}:${action} permission`);
        } else if (!hasBranchAccess) {
          toast.error('Access denied: Branch restriction applies');
        }

        // Use custom redirect or render AccessDenied component
        if (redirectTo) {
          return <Navigate to={redirectTo} replace />;
        }

        return (
          <AccessDenied 
            message={accessDeniedMessage || `You need ${module}:${action} permission to access this page.`}
          />
        );
      }
    } catch (error) {
      // Handle permission check errors
      console.error('Permission check failed:', error);
      toast.error('Failed to verify permissions. Please try again.');
      
      return (
        <AccessDenied 
          message="Unable to verify permissions. Please refresh the page or contact support."
        />
      );
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
