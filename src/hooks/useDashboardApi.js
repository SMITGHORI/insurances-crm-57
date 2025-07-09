
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { dashboardApiService } from '../services/api/dashboardApiService';
import { toast } from 'sonner';

/**
 * Enhanced dashboard hooks with proper API integration and real-time updates
 */

// Query keys for cache management
export const DASHBOARD_QUERY_KEYS = {
  overview: ['dashboard', 'overview'],
  activities: (limit) => ['dashboard', 'activities', limit],
  metrics: (period) => ['dashboard', 'metrics', period],
  charts: (type) => ['dashboard', 'charts', type],
  quickActions: ['dashboard', 'quickActions'],
  aggregated: ['dashboard', 'aggregated']
};

/**
 * Hook for dashboard overview data with real-time updates
 */
export const useDashboardOverview = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.overview,
    queryFn: async () => {
      const result = await dashboardApiService.getDashboardOverview();
      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Dashboard overview error:', error);
      toast.error('Failed to load dashboard overview');
    },
  });

  // Listen for real-time updates from all modules
  useEffect(() => {
    const handleModuleUpdate = (event) => {
      console.log('Module update detected for overview:', event.type);
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.overview });
    };

    const moduleEvents = [
      'client-updated', 'client-created', 'client-deleted',
      'policy-updated', 'policy-created', 'policy-deleted',
      'claim-updated', 'claim-created', 'claim-deleted',
      'lead-updated', 'lead-created', 'lead-deleted',
      'quotation-updated', 'quotation-created', 'quotation-deleted',
      'offer-updated', 'offer-created', 'offer-deleted',
      'broadcast-sent', 'broadcast-created'
    ];

    moduleEvents.forEach(event => {
      window.addEventListener(event, handleModuleUpdate);
    });

    return () => {
      moduleEvents.forEach(event => {
        window.removeEventListener(event, handleModuleUpdate);
      });
    };
  }, [queryClient]);

  return query;
};

/**
 * Hook for recent activities with real-time updates
 */
export const useDashboardActivities = (limit = 10) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.activities(limit),
    queryFn: async () => {
      const result = await dashboardApiService.getRecentActivities(limit);
      return result.data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (error) => {
      console.error('Dashboard activities error:', error);
      toast.error('Failed to load recent activities');
    },
  });

  // Listen for real-time activity updates
  useEffect(() => {
    const handleActivityUpdate = (event) => {
      console.log('Activity update detected:', event.type);
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.activities(limit) });
    };

    const activityEvents = [
      'activity-created', 'entity-updated', 'entity-created', 'entity-deleted'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivityUpdate);
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivityUpdate);
      });
    };
  }, [queryClient, limit]);

  return query;
};

/**
 * Hook for performance metrics with real-time calculations
 */
export const useDashboardMetrics = (period = '30d') => {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.metrics(period),
    queryFn: async () => {
      const result = await dashboardApiService.getPerformanceMetrics(period);
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (error) => {
      console.error('Dashboard metrics error:', error);
      toast.error('Failed to load performance metrics');
    },
  });

  return query;
};

/**
 * Hook for charts data with real-time updates
 */
export const useDashboardCharts = (type = 'all') => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.charts(type),
    queryFn: async () => {
      const result = await dashboardApiService.getChartsData(type);
      return result.data;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchInterval: 1000 * 60 * 7, // Refetch every 7 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (error) => {
      console.error('Dashboard charts error:', error);
      toast.error('Failed to load charts data');
    },
  });

  // Listen for data changes that affect charts
  useEffect(() => {
    const handleDataChange = (event) => {
      console.log('Data change detected for charts:', event.type);
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.charts(type) });
    };

    const dataEvents = [
      'policy-created', 'policy-updated', 'policy-deleted',
      'claim-created', 'claim-updated', 'claim-deleted',
      'lead-created', 'lead-updated', 'lead-deleted',
      'quotation-created', 'quotation-updated', 'quotation-deleted',
      'client-created', 'client-updated', 'client-deleted'
    ];

    dataEvents.forEach(event => {
      window.addEventListener(event, handleDataChange);
    });

    return () => {
      dataEvents.forEach(event => {
        window.removeEventListener(event, handleDataChange);
      });
    };
  }, [queryClient, type]);

  return query;
};

/**
 * Hook for quick actions with real-time updates
 */
export const useDashboardQuickActions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.quickActions,
    queryFn: async () => {
      const result = await dashboardApiService.getQuickActions();
      return result.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    onError: (error) => {
      console.error('Dashboard quick actions error:', error);
      toast.error('Failed to load quick actions');
    },
  });

  // Listen for updates that affect quick actions
  useEffect(() => {
    const handleQuickActionUpdate = (event) => {
      console.log('Quick action update detected:', event.type);
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.quickActions });
    };

    const quickActionEvents = [
      'claim-created', 'claim-updated',
      'policy-updated', 'policy-expiring',
      'lead-updated', 'lead-overdue',
      'quotation-created', 'quotation-updated'
    ];

    quickActionEvents.forEach(event => {
      window.addEventListener(event, handleQuickActionUpdate);
    });

    return () => {
      quickActionEvents.forEach(event => {
        window.removeEventListener(event, handleQuickActionUpdate);
      });
    };
  }, [queryClient]);

  return query;
};

/**
 * Hook for dashboard refresh functionality
 */
export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: dashboardApiService.refreshDashboard,
    onSuccess: () => {
      // Invalidate all dashboard queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Dashboard refreshed successfully');
    },
    onError: (error) => {
      console.error('Dashboard refresh failed:', error);
      toast.error('Failed to refresh dashboard');
    },
  });

  const refreshDashboard = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  return {
    refreshDashboard,
    isRefreshing: refreshMutation.isPending
  };
};

/**
 * Combined hook for all dashboard data with real-time updates
 */
export const useDashboardData = () => {
  const overview = useDashboardOverview();
  const activities = useDashboardActivities(10);
  const metrics = useDashboardMetrics('30d');
  const charts = useDashboardCharts('all');
  const quickActions = useDashboardQuickActions();
  const { refreshDashboard, isRefreshing } = useDashboardRefresh();

  const isLoading = overview.isLoading || activities.isLoading || metrics.isLoading || 
                   charts.isLoading || quickActions.isLoading;
  const isError = overview.isError || activities.isError || metrics.isError || 
                 charts.isError || quickActions.isError;

  const lastUpdated = Math.max(
    overview.dataUpdatedAt || 0,
    activities.dataUpdatedAt || 0,
    metrics.dataUpdatedAt || 0,
    charts.dataUpdatedAt || 0,
    quickActions.dataUpdatedAt || 0
  );

  return {
    overview: overview.data,
    activities: activities.data,
    metrics: metrics.data,
    charts: charts.data,
    quickActions: quickActions.data,
    isLoading,
    isError,
    isRefreshing,
    lastUpdated: new Date(lastUpdated),
    refreshDashboard,
    refetch: {
      overview: overview.refetch,
      activities: activities.refetch,
      metrics: metrics.refetch,
      charts: charts.refetch,
      quickActions: quickActions.refetch
    }
  };
};
