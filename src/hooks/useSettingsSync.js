
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { settingsQueryKeys } from './useSettings';

/**
 * Hook for real-time settings synchronization
 * Listens for settings changes and updates the cache accordingly
 */
export const useSettingsSync = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handleSettingsUpdate = (event) => {
      const { type, data } = event.detail;
      
      console.log(`Settings sync: ${type} update received`, data);
      
      // Update the settings cache based on the update type
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (oldSettings) => {
        if (!oldSettings) return oldSettings;
        
        switch (type) {
          case 'profile':
            return {
              ...oldSettings,
              profile: { ...oldSettings.profile, ...data.profile }
            };
            
          case 'notifications':
            return {
              ...oldSettings,
              notifications: { ...oldSettings.notifications, ...data.notifications }
            };
            
          case 'security':
            return {
              ...oldSettings,
              security: { ...oldSettings.security, ...data.security }
            };
            
          case 'preferences':
            return {
              ...oldSettings,
              preferences: { ...oldSettings.preferences, ...data.preferences }
            };
            
          case 'password':
            return {
              ...oldSettings,
              security: {
                ...oldSettings.security,
                passwordLastChanged: new Date().toISOString()
              }
            };
            
          case 'reset':
            return data;
            
          case 'import':
            return data;
            
          default:
            return oldSettings;
        }
      });
      
      // Also invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.user(user._id),
        exact: false
      });
    };

    const handleUserUpdate = () => {
      console.log('Settings sync: User update detected');
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.user(user._id)
      });
    };

    const handleSystemUpdate = () => {
      console.log('Settings sync: System update detected');
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.all
      });
    };

    // Event listeners for different types of updates
    const events = [
      { name: 'settings-updated', handler: handleSettingsUpdate },
      { name: 'user-updated', handler: handleUserUpdate },
      { name: 'profile-updated', handler: handleUserUpdate },
      { name: 'preferences-changed', handler: handleUserUpdate },
      { name: 'system-settings-changed', handler: handleSystemUpdate },
      { name: 'theme-changed', handler: handleUserUpdate },
      { name: 'language-changed', handler: handleUserUpdate }
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
  }, [queryClient, user]);

  // Function to manually refresh settings
  const refreshSettings = () => {
    if (user) {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.user(user._id)
      });
    }
  };

  // Function to clear settings cache
  const clearSettingsCache = () => {
    queryClient.removeQueries({
      queryKey: settingsQueryKeys.all
    });
  };

  return {
    refreshSettings,
    clearSettingsCache
  };
};

export default useSettingsSync;
