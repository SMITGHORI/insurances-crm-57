
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { recentActivitiesApi } from '@/services/api/recentActivitiesApi';

// Query keys for cache management
export const activitiesQueryKeys = {
  all: ['activities'],
  lists: () => [...activitiesQueryKeys.all, 'list'],
  list: (params) => [...activitiesQueryKeys.lists(), params],
  detail: (id) => [...activitiesQueryKeys.all, 'detail', id],
  stats: (timeframe) => [...activitiesQueryKeys.all, 'stats', timeframe],
  settings: () => [...activitiesQueryKeys.all, 'settings'],
  filters: () => [...activitiesQueryKeys.all, 'filters'],
  search: (query) => [...activitiesQueryKeys.all, 'search', query]
};

/**
 * Hook to fetch activities with filtering and pagination from MongoDB
 */
export const useActivities = (params = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.list(params),
    queryFn: () => recentActivitiesApi.getActivities(params),
    enabled: user?.role === 'super_admin',
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activities from MongoDB:', error);
      toast.error('Failed to load activities from database');
    },
  });
};

/**
 * Hook to fetch a single activity by ID from MongoDB
 */
export const useActivity = (activityId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.detail(activityId),
    queryFn: () => recentActivitiesApi.getActivityById(activityId),
    enabled: !!activityId && user?.role === 'super_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activity from MongoDB:', error);
      toast.error('Failed to load activity details');
    },
  });
};

/**
 * Hook to get activity statistics from MongoDB
 */
export const useActivityStats = (timeframe = '24h') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.stats(timeframe),
    queryFn: () => recentActivitiesApi.getActivityStats({ timeframe }),
    enabled: user?.role === 'super_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activity stats from MongoDB:', error);
      toast.error('Failed to load activity statistics');
    },
  });
};

/**
 * Hook to get filter values for dropdowns from MongoDB
 */
export const useActivityFilters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.filters(),
    queryFn: () => recentActivitiesApi.getFilterValues(),
    enabled: user?.role === 'super_admin',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching filter values from MongoDB:', error);
      toast.error('Failed to load filter options');
    },
  });
};

/**
 * Hook to search activities in MongoDB
 */
export const useActivitySearch = (query) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.search(query),
    queryFn: () => recentActivitiesApi.searchActivities(query),
    enabled: !!query && query.length >= 2 && user?.role === 'super_admin',
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    onError: (error) => {
      console.error('Error searching activities in MongoDB:', error);
      toast.error('Failed to search activities');
    },
  });
};

/**
 * Hook to create new activity in MongoDB
 */
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityData) => recentActivitiesApi.createActivity(activityData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.stats() });
      toast.success('Activity logged successfully');
      
      // Trigger dashboard update
      window.dispatchEvent(new CustomEvent('activity-created', { detail: data }));
    },
    onError: (error) => {
      console.error('Error creating activity in MongoDB:', error);
      toast.error('Failed to log activity');
    },
  });
};

/**
 * Hook to archive expired activities in MongoDB
 */
export const useArchiveExpiredActivities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => recentActivitiesApi.archiveExpiredActivities(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.stats() });
      toast.success(`${data.archivedCount} activities archived successfully`);
    },
    onError: (error) => {
      console.error('Error archiving activities in MongoDB:', error);
      toast.error('Failed to archive activities');
    },
  });
};

/**
 * Hook for real-time activity updates
 */
export const useRealtimeActivities = () => {
  const queryClient = useQueryClient();

  const refreshActivities = () => {
    queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
    queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.stats() });
  };

  // Set up real-time listeners
  React.useEffect(() => {
    const events = [
      'activity-created',
      'client-updated', 'client-created', 'client-deleted',
      'policy-updated', 'policy-created', 'policy-deleted',
      'claim-updated', 'claim-created', 'claim-deleted',
      'lead-updated', 'lead-created', 'lead-deleted',
      'quotation-updated', 'quotation-created', 'quotation-deleted',
      'offer-updated', 'offer-created', 'offer-deleted',
      'broadcast-sent', 'broadcast-created'
    ];

    const handleUpdate = (event) => {
      console.log(`Activity update triggered by: ${event.type}`);
      refreshActivities();
    };

    events.forEach(eventType => {
      window.addEventListener(eventType, handleUpdate);
    });

    return () => {
      events.forEach(eventType => {
        window.removeEventListener(eventType, handleUpdate);
      });
    };
  }, [queryClient]);

  return { refreshActivities };
};
