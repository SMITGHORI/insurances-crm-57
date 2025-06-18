
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../services/api/dashboardApi';

/**
 * Hook for dashboard overview data
 */
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getDashboardOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for recent activities
 */
export const useRecentActivities = (limit = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => dashboardApi.getRecentActivities(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for performance metrics
 */
export const usePerformanceMetrics = (period = '30d') => {
  return useQuery({
    queryKey: ['dashboard', 'performance', period],
    queryFn: () => dashboardApi.getPerformanceMetrics(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for charts data
 */
export const useChartsData = (type = 'all') => {
  return useQuery({
    queryKey: ['dashboard', 'charts', type],
    queryFn: () => dashboardApi.getChartsData(type),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for quick actions
 */
export const useQuickActions = () => {
  return useQuery({
    queryKey: ['dashboard', 'quickActions'],
    queryFn: () => dashboardApi.getQuickActions(),
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false
  });
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
      queryClient.setQueryData(['dashboard', 'overview'], data.overview);
      queryClient.setQueryData(['dashboard', 'activities'], data.activities);
      queryClient.setQueryData(['dashboard', 'performance'], data.metrics);
      queryClient.setQueryData(['dashboard', 'charts'], data.charts);
      queryClient.setQueryData(['dashboard', 'quickActions'], data.quickActions);

      return data;
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw error;
    }
  };

  return { refreshDashboard };
};

/**
 * Combined hook for all dashboard data
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
