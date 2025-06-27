
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, isSameBranch, user } = useAuth();

  /**
   * Component wrapper for permission-based rendering
   */
  const canRender = (module: string, action: string): boolean => {
    return hasPermission(module, action);
  };

  /**
   * Check multiple permissions at once
   */
  const canPerformActions = (permissions: string[]): boolean => {
    return hasAnyPermission(permissions);
  };

  /**
   * Get user's branch-filtered data
   */
  const filterByBranch = <T extends { branch?: string }>(data: T[]): T[] => {
    if (!user) return [];
    
    // Super admin sees all data
    if (user.role === 'super_admin') return data;
    
    // Filter by user's branch
    return data.filter(item => 
      !item.branch || 
      item.branch === user.branch || 
      item.branch === 'all'
    );
  };

  /**
   * Check if user can edit specific record based on branch
   */
  const canEditRecord = (recordBranch?: string): boolean => {
    if (!recordBranch) return true;
    return isSameBranch(recordBranch);
  };

  return {
    hasPermission,
    hasAnyPermission,
    isSameBranch,
    canRender,
    canPerformActions,
    filterByBranch,
    canEditRecord,
    userBranch: user?.branch,
    userRole: user?.role,
    userPermissions: user?.permissions || []
  };
};
