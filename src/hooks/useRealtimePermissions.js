
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook for real-time permission updates
 * Listens for permission changes and updates user permissions accordingly
 */
export const useRealtimePermissions = () => {
  const queryClient = useQueryClient();
  const { user, refreshPermissions } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handlePermissionUpdate = async (event) => {
      const { roleId, permissions } = event.detail;
      
      console.log('Permission update received:', { roleId, permissions });
      
      // Check if this update affects the current user
      if (user.role && roleId) {
        // Get user's role ID and compare
        try {
          const response = await fetch('/api/roles');
          const roles = await response.json();
          const userRole = roles.data?.find(r => r.name === user.role);
          
          if (userRole && userRole._id === roleId) {
            console.log('Permission update applies to current user');
            
            // Refresh user permissions
            await refreshPermissions();
            
            // Show notification
            toast.info('Your permissions have been updated', {
              description: 'Please refresh the page if you experience any issues.'
            });
            
            // Invalidate all queries to force refresh
            queryClient.invalidateQueries();
            
            // Trigger a page refresh after a short delay to ensure all components update
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking permission update:', error);
        }
      }
    };

    const handleUserUpdate = () => {
      console.log('User update detected - refreshing permissions');
      refreshPermissions();
      queryClient.invalidateQueries();
    };

    const handleRoleUpdate = () => {
      console.log('Role update detected - refreshing all role-related data');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    };

    // Event listeners for real-time updates
    const events = [
      { name: 'permissions-updated', handler: handlePermissionUpdate },
      { name: 'user-permissions-changed', handler: handleUserUpdate },
      { name: 'role-updated', handler: handleRoleUpdate },
      { name: 'user-role-changed', handler: handleUserUpdate }
    ];

    // Add event listeners
    events.forEach(({ name, handler }) => {
      window.addEventListener(name, handler);
    });

    // Cleanup event listeners
    return () => {
      events.forEach(({ name, handler }) => {
        window.removeEventListener(name, handler);
      });
    };
  }, [queryClient, user, refreshPermissions]);

  // Function to trigger permission refresh
  const triggerPermissionRefresh = () => {
    refreshPermissions();
    queryClient.invalidateQueries();
  };

  return {
    triggerPermissionRefresh
  };
};

export default useRealtimePermissions;
