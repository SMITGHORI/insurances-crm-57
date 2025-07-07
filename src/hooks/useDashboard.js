
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { dashboardApi } from '../services/api/dashboardApi';
import useWebSocket from './useWebSocket';

/**
 * Hook for dashboard overview data with real-time MongoDB updates
 */
export const useDashboardOverview = () => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getOverviewData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error fetching dashboard overview from MongoDB:', error);
    },
  });

  // Listen for real-time updates from all modules
  useEffect(() => {
    const handleModuleUpdate = () => {
      console.log('Module update detected, refreshing dashboard overview');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    };

    const events = [
      'client-updated', 'policy-updated', 'claim-updated', 
      'lead-updated', 'quotation-updated', 'offer-updated', 
      'broadcast-sent', 'dashboard-refresh'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleModuleUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleModuleUpdate);
      });
    };
  }, [queryClient]);

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'dashboard-update' || lastMessage?.type === 'module-update') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for recent activities with real-time MongoDB updates
 */
export const useRecentActivities = (limit = 10) => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => dashboardApi.getRecentActivities(limit),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error fetching recent activities from MongoDB:', error);
    },
  });

  // Listen for entity updates from all modules
  useEffect(() => {
    const handleEntityUpdate = () => {
      console.log('Entity update detected, refreshing activities');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'activities'] });
    };

    const events = [
      'client-created', 'client-updated', 'client-deleted',
      'policy-created', 'policy-updated', 'policy-deleted',
      'claim-created', 'claim-updated', 'claim-deleted',
      'lead-created', 'lead-updated', 'lead-deleted',
      'quotation-created', 'quotation-updated', 'quotation-deleted',
      'offer-created', 'offer-updated', 'offer-deleted',
      'broadcast-created', 'broadcast-sent'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleEntityUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleEntityUpdate);
      });
    };
  }, [queryClient]);

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'entity-updated' || lastMessage?.type === 'activity-created') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for performance metrics from MongoDB
 */
export const usePerformanceMetrics = (period = '30d') => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['dashboard', 'performance', period],
    queryFn: () => dashboardApi.getPerformanceMetrics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error fetching performance metrics from MongoDB:', error);
    },
  });
};

/**
 * Hook for charts data with real-time MongoDB updates
 */
export const useChartsData = (type = 'all') => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'charts', type],
    queryFn: () => dashboardApi.getChartsData(type),
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error fetching charts data from MongoDB:', error);
    },
  });

  // Listen for data changes that affect charts
  useEffect(() => {
    const handleDataChange = () => {
      console.log('Data change detected, refreshing charts');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'charts'] });
    };

    const events = [
      'policy-created', 'policy-updated',
      'claim-created', 'claim-updated', 
      'lead-created', 'lead-updated',
      'quotation-created', 'quotation-updated'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleDataChange);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleDataChange);
      });
    };
  }, [queryClient]);

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'dashboard-update' || lastMessage?.type === 'data-changed') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for quick actions with real-time MongoDB updates
 */
export const useQuickActions = () => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'quickActions'],
    queryFn: () => dashboardApi.getQuickActions(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error fetching quick actions from MongoDB:', error);
    },
  });

  // Listen for updates that affect quick actions
  useEffect(() => {
    const handleQuickActionUpdate = () => {
      console.log('Quick action update detected, refreshing');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'quickActions'] });
    };

    const events = [
      'claim-created', 'claim-updated',
      'policy-updated', 'policy-expiring',
      'lead-updated', 'lead-overdue',
      'quotation-created', 'quotation-updated'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleQuickActionUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleQuickActionUpdate);
      });
    };
  }, [queryClient]);

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'quick-action-update' || lastMessage?.type === 'entity-updated') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for refreshing all dashboard data from MongoDB
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = async () => {
    try {
      console.log('Manually refreshing all dashboard data from MongoDB');
      
      // Invalidate all dashboard queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Fetch fresh data from individual endpoints
      const [overview, activities, metrics, charts, quickActions] = await Promise.all([
        dashboardApi.getOverviewData(),
        dashboardApi.getRecentActivities(10),
        dashboardApi.getPerformanceMetrics('30d'),
        dashboardApi.getChartsData('all'),
        dashboardApi.getQuickActions()
      ]);
      
      // Update query cache with fresh data
      queryClient.setQueryData(['dashboard', 'overview'], overview);
      queryClient.setQueryData(['dashboard', 'activities', 10], activities);
      queryClient.setQueryData(['dashboard', 'performance', '30d'], metrics);
      queryClient.setQueryData(['dashboard', 'charts', 'all'], charts);
      queryClient.setQueryData(['dashboard', 'quickActions'], quickActions);

      return { overview, activities, metrics, charts, quickActions };
    } catch (error) {
      console.error('Failed to refresh dashboard from MongoDB:', error);
      throw error;
    }
  };

  return { refreshDashboard };
};

/**
 * Combined hook for all dashboard data with real-time MongoDB updates
 */
export const useDashboardData = () => {
  const overview = useDashboardOverview();
  const activities = useRecentActivities(10);
  const metrics = usePerformanceMetrics('30d');
  const charts = useChartsData('all');
  const quickActions = useQuickActions();

  const isLoading = overview.isLoading || activities.isLoading || metrics.isLoading || charts.isLoading || quickActions.isLoading;
  const isError = overview.isError || activities.isError || metrics.isError || charts.isError || quickActions.isError;

  // Set up real-time module integration
  useEffect(() => {
    // TODO: Implement real-time subscription when backend supports it
    console.log('Dashboard data hooks initialized');
    
    // For now, we'll rely on the individual hooks' WebSocket listeners
    // and periodic refetching instead of a centralized subscription
  }, [overview, activities, metrics, charts, quickActions]);

  return {
    overview: overview.data,
    activities: activities.data,
    metrics: metrics.data,
    charts: charts.data,
    quickActions: quickActions.data,
    isLoading,
    isError,
    refetch: {
      overview: overview.refetch,
      activities: activities.refetch,
      metrics: metrics.refetch,
      charts: charts.refetch,
      quickActions: quickActions.refetch
    }
  };
};
