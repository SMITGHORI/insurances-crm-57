
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth';

/**
 * Interface for the usePermissions hook return type
 */
export interface UsePermissionsResult {
  hasPermission(module: string, action: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  isSameBranch(recordBranch: string): boolean;
  userBranch: string | undefined;
  userRole: string | undefined;
  userPermissions: Permission[];
}

/**
 * Custom hook that provides memoized permission checking utilities
 * Consumes AuthContext and exposes permission validation methods
 */
export const usePermissions = (): UsePermissionsResult => {
  const { hasPermission, hasAnyPermission, isSameBranch, user } = useAuth();

  // Memoize permission methods for performance
  const memoizedPermissions = useMemo(() => ({
    hasPermission: (module: string, action: string): boolean => {
      return hasPermission(module, action);
    },
    hasAnyPermission: (permissions: string[]): boolean => {
      return hasAnyPermission(permissions);
    },
    isSameBranch: (recordBranch: string): boolean => {
      return isSameBranch(recordBranch);
    },
    userBranch: user?.branch,
    userRole: user?.role,
    userPermissions: user?.permissions || []
  }), [hasPermission, hasAnyPermission, isSameBranch, user]);

  return memoizedPermissions;
};
