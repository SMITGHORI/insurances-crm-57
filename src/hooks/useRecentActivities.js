
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recentActivitiesApi } from '../services/api/recentActivitiesApi';

/**
 * React Query hooks for recent activities management
 * Provides optimistic updates and proper error handling
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Query keys for cache management
export const activitiesQueryKeys = {
  all: ['activities'],
  lists: () => [...activitiesQueryKeys.all, 'list'],
  list: (params) => [...activitiesQueryKeys.lists(), params],
  details: () => [...activitiesQueryKeys.all, 'detail'],
  detail: (id) => [...activitiesQueryKeys.details(), id],
  stats: () => [...activitiesQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch activities with filtering and pagination
 */
export const useActivities = (params = {}) => {
  return useQuery({
    queryKey: activitiesQueryKeys.list(params),
    queryFn: () => recentActivitiesApi.getActivities(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (activities change frequently)
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (recentActivitiesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching activities:', error);
      if (!recentActivitiesApi.isOfflineMode) {
        toast.error('Failed to load activities - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single activity by ID
 */
export const useActivity = (activityId) => {
  return useQuery({
    queryKey: activitiesQueryKeys.detail(activityId),
    queryFn: () => recentActivitiesApi.getActivityById(activityId),
    enabled: !!activityId, // Only run if activityId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (recentActivitiesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching activity:', error);
      if (!recentActivitiesApi.isOfflineMode) {
        toast.error('Failed to load activity details');
      }
    },
  });
};

/**
 * Hook to create a new activity
 */
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData) => {
      console.log('Creating activity with data:', activityData);
      
      // Basic validation
      if (!activityData.action || !activityData.type) {
        throw new Error('Missing required fields: action or type');
      }

      return recentActivitiesApi.createActivity(activityData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch activities list
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      
      const mode = recentActivitiesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Activity created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating activity:', error);
      toast.error(`Failed to create activity: ${error.message}`);
    },
  });
};

/**
 * Hook to get activity statistics
 */
export const useActivityStats = (params = {}) => {
  return useQuery({
    queryKey: [...activitiesQueryKeys.stats(), params],
    queryFn: () => recentActivitiesApi.getActivityStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (recentActivitiesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching activity stats:', error);
      if (!recentActivitiesApi.isOfflineMode) {
        toast.error('Failed to load activity statistics');
      }
    },
  });
};
