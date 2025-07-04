
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { settingsBackendApi } from '@/services/api/settingsApiBackend';

// Query keys for cache management
export const settingsQueryKeys = {
  all: ['settings'],
  user: (userId) => [...settingsQueryKeys.all, 'user', userId],
  stats: () => [...settingsQueryKeys.all, 'stats'],
  export: (userId) => [...settingsQueryKeys.all, 'export', userId]
};

/**
 * Main settings hook for user settings management
 */
export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user settings
  const {
    data: settings,
    isLoading: loading,
    error,
    refetch: refreshSettings
  } = useQuery({
    queryKey: settingsQueryKeys.user(user?._id),
    queryFn: () => settingsBackendApi.getSettings(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching settings from MongoDB:', error);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => settingsBackendApi.updateProfile(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (old) => ({
        ...old,
        profile: { ...old?.profile, ...data.profile }
      }));
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'profile', data } 
      }));
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      throw error;
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (notificationData) => settingsBackendApi.updateNotifications(notificationData),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (old) => ({
        ...old,
        notifications: { ...old?.notifications, ...data.notifications }
      }));
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'notifications', data } 
      }));
    },
    onError: (error) => {
      console.error('Error updating notifications:', error);
      throw error;
    },
  });

  // Update security mutation
  const updateSecurityMutation = useMutation({
    mutationFn: (securityData) => settingsBackendApi.updateSecurity(securityData),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (old) => ({
        ...old,
        security: { ...old?.security, ...data.security }
      }));
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'security', data } 
      }));
    },
    onError: (error) => {
      console.error('Error updating security:', error);
      throw error;
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferencesData) => settingsBackendApi.updatePreferences(preferencesData),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (old) => ({
        ...old,
        preferences: { ...old?.preferences, ...data.preferences }
      }));
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'preferences', data } 
      }));
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      throw error;
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => settingsBackendApi.changePassword(passwordData),
    onSuccess: (data) => {
      // Update password change timestamp in cache
      queryClient.setQueryData(settingsQueryKeys.user(user._id), (old) => ({
        ...old,
        security: { 
          ...old?.security, 
          passwordLastChanged: new Date().toISOString() 
        }
      }));
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'password', data } 
      }));
    },
    onError: (error) => {
      console.error('Error changing password:', error);
      throw error;
    },
  });

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: () => settingsBackendApi.resetSettings(),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), data);
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'reset', data } 
      }));
    },
    onError: (error) => {
      console.error('Error resetting settings:', error);
      throw error;
    },
  });

  return {
    settings,
    loading: loading || updateProfileMutation.isLoading || updateNotificationsMutation.isLoading || 
             updateSecurityMutation.isLoading || updatePreferencesMutation.isLoading || 
             changePasswordMutation.isLoading || resetSettingsMutation.isLoading,
    error,
    refreshSettings,
    
    // Mutation functions
    updateProfile: updateProfileMutation.mutateAsync,
    updateNotifications: updateNotificationsMutation.mutateAsync,
    updateSecurity: updateSecurityMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    resetSettings: resetSettingsMutation.mutateAsync,
  };
};

/**
 * Hook for settings statistics (Admin only)
 */
export const useSettingsStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: settingsQueryKeys.stats(),
    queryFn: () => settingsBackendApi.getSettingsStats(),
    enabled: user?.role === 'super_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching settings stats:', error);
    },
  });
};

/**
 * Hook for exporting settings
 */
export const useExportSettings = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => settingsBackendApi.exportSettings(),
    onSuccess: (data) => {
      // Create and download the export file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting settings:', error);
      toast.error('Failed to export settings');
    },
  });
};

/**
 * Hook for importing settings
 */
export const useImportSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingsData) => settingsBackendApi.importSettings(settingsData),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user(user._id), data);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user(user._id) });
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('settings-updated', { 
        detail: { type: 'import', data } 
      }));
      
      toast.success('Settings imported successfully');
    },
    onError: (error) => {
      console.error('Error importing settings:', error);
      toast.error('Failed to import settings');
    },
  });
};

/**
 * Hook for real-time settings updates
 */
export const useRealtimeSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const refreshSettings = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user(user._id) });
    }
  };

  // Set up real-time listeners
  React.useEffect(() => {
    const events = [
      'settings-updated',
      'user-updated',
      'profile-updated',
      'preferences-changed'
    ];

    const handleUpdate = (event) => {
      console.log(`Settings update triggered by: ${event.type}`);
      refreshSettings();
    };

    events.forEach(eventType => {
      window.addEventListener(eventType, handleUpdate);
    });

    return () => {
      events.forEach(eventType => {
        window.removeEventListener(eventType, handleUpdate);
      });
    };
  }, [queryClient, user]);

  return { refreshSettings };
};
