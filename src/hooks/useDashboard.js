
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { dashboardApi } from '../services/api/dashboardApi';
import useWebSocket from './useWebSocket';

/**
 * Hook for dashboard overview data with real-time updates
 */
export const useDashboardOverview = () => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getDashboardOverview(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });

  // Listen for real-time updates
  useEffect(() => {
    const handleDashboardRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    };

    window.addEventListener('dashboard-refresh', handleDashboardRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleDashboardRefresh);
  }, [queryClient]);

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'dashboard-update') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for recent activities with real-time updates
 */
export const useRecentActivities = (limit = 10) => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => dashboardApi.getRecentActivities(limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false
  });

  // Listen for entity updates
  useEffect(() => {
    const handleEntityUpdate = (event) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'activities'] });
    };

    window.addEventListener('entity-updated', handleEntityUpdate);
    return () => window.removeEventListener('entity-updated', handleEntityUpdate);
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
 * Hook for performance metrics
 */
export const usePerformanceMetrics = (period = '30d') => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['dashboard', 'performance', period],
    queryFn: () => dashboardApi.getPerformanceMetrics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for charts data with real-time updates
 */
export const useChartsData = (type = 'all') => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'charts', type],
    queryFn: () => dashboardApi.getChartsData(type),
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false
  });

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'dashboard-update' || lastMessage?.type === 'data-changed') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for quick actions with real-time updates
 */
export const useQuickActions = () => {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const query = useQuery({
    queryKey: ['dashboard', 'quickActions'],
    queryFn: () => dashboardApi.getQuickActions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });

  // Auto-refresh on WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'quick-action-update' || lastMessage?.type === 'entity-updated') {
      query.refetch();
    }
  }, [lastMessage, query]);

  return query;
};

/**
 * Hook for refreshing all dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = async () => {
    try {
      // Invalidate all dashboard queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Optionally fetch fresh data
      const data = await dashboardApi.refreshDashboard();
      
      // Update query cache with fresh data
      if (data.overview) {
        queryClient.setQueryData(['dashboard', 'overview'], data.overview);
      }
      if (data.activities) {
        queryClient.setQueryData(['dashboard', 'activities'], data.activities);
      }
      if (data.metrics) {
        queryClient.setQueryData(['dashboard', 'performance'], data.metrics);
      }
      if (data.charts) {
        queryClient.setQueryData(['dashboard', 'charts'], data.charts);
      }
      if (data.quickActions) {
        queryClient.setQueryData(['dashboard', 'quickActions'], data.quickActions);
      }

      return data;
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw error;
    }
  };

  return { refreshDashboard };
};

/**
 * Combined hook for all dashboard data with real-time updates
 */
export const useDashboardData = () => {
  const overview = useDashboardOverview();
  const activities = useRecentActivities(10);
  const metrics = usePerformanceMetrics('30d');
  const charts = useChartsData('all');
  const quickActions = useQuickActions();

  const isLoading = overview.isLoading || activities.isLoading || metrics.isLoading || charts.isLoading || quickActions.isLoading;
  const isError = overview.isError || activities.isError || metrics.isError || charts.isError || quickActions.isError;

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
