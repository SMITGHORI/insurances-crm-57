
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// API service for backend integration
const activitiesApi = {
  async getActivities(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`/api/activities?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }

    return response.json();
  },

  async getActivityById(id) {
    const response = await fetch(`/api/activities/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }

    return response.json();
  },

  async getActivityStats(timeframe = '24h') {
    const response = await fetch(`/api/activities/stats?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity statistics');
    }

    return response.json();
  },

  async getFilterValues() {
    const response = await fetch('/api/activities/filters', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch filter values');
    }

    return response.json();
  },

  async searchActivities(query) {
    const response = await fetch(`/api/activities/search/${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search activities');
    }

    return response.json();
  },

  async getActivitySettings() {
    const response = await fetch('/api/activities/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity settings');
    }

    return response.json();
  },

  async updateActivitySettings(key, value) {
    const response = await fetch('/api/activities/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, value })
    });

    if (!response.ok) {
      throw new Error('Failed to update activity settings');
    }

    return response.json();
  },

  async archiveExpiredActivities() {
    const response = await fetch('/api/activities/archive-expired', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to archive activities');
    }

    return response.json();
  }
};

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
 * Hook to fetch activities with filtering and pagination
 * Only accessible to super admins
 */
export const useActivities = (params = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.list(params),
    queryFn: () => activitiesApi.getActivities(params),
    enabled: user?.role === 'super_admin',
    staleTime: 30 * 1000, // 30 seconds - activities change frequently
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    },
  });
};

/**
 * Hook to fetch a single activity by ID
 */
export const useActivity = (activityId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.detail(activityId),
    queryFn: () => activitiesApi.getActivityById(activityId),
    enabled: !!activityId && user?.role === 'super_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity details');
    },
  });
};

/**
 * Hook to get activity statistics
 */
export const useActivityStats = (timeframe = '24h') => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.stats(timeframe),
    queryFn: () => activitiesApi.getActivityStats(timeframe),
    enabled: user?.role === 'super_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activity stats:', error);
      toast.error('Failed to load activity statistics');
    },
  });
};

/**
 * Hook to get filter values for dropdowns
 */
export const useActivityFilters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.filters(),
    queryFn: () => activitiesApi.getFilterValues(),
    enabled: user?.role === 'super_admin',
    staleTime: 10 * 60 * 1000, // 10 minutes - filter values don't change often
    retry: 2,
    onError: (error) => {
      console.error('Error fetching filter values:', error);
      toast.error('Failed to load filter options');
    },
  });
};

/**
 * Hook to search activities
 */
export const useActivitySearch = (query) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.search(query),
    queryFn: () => activitiesApi.searchActivities(query),
    enabled: !!query && query.length >= 2 && user?.role === 'super_admin',
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    onError: (error) => {
      console.error('Error searching activities:', error);
      toast.error('Failed to search activities');
    },
  });
};

/**
 * Hook to get activity settings
 */
export const useActivitySettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: activitiesQueryKeys.settings(),
    queryFn: () => activitiesApi.getActivitySettings(),
    enabled: user?.role === 'super_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching activity settings:', error);
      toast.error('Failed to load activity settings');
    },
  });
};

/**
 * Hook to update activity settings
 */
export const useUpdateActivitySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ key, value }) => activitiesApi.updateActivitySettings(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.settings() });
      toast.success('Activity settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating activity settings:', error);
      toast.error('Failed to update activity settings');
    },
  });
};

/**
 * Hook to archive expired activities
 */
export const useArchiveExpiredActivities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => activitiesApi.archiveExpiredActivities(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activitiesQueryKeys.stats() });
      toast.success(`${data.data.archivedCount} activities archived successfully`);
    },
    onError: (error) => {
      console.error('Error archiving activities:', error);
      toast.error('Failed to archive activities');
    },
  });
};
