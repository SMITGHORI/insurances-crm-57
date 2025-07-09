// Legacy file - keeping for backward compatibility
// Redirecting to new enhanced API hooks
export { 
  useDashboardData,
  useDashboardOverview,
  useDashboardActivities as useRecentActivities,
  useDashboardMetrics as usePerformanceMetrics,
  useDashboardCharts as useChartsData,
  useDashboardQuickActions as useQuickActions,
  useDashboardRefresh as useRefreshDashboard,
  DASHBOARD_QUERY_KEYS
} from './useDashboardApi';

// Keep the existing interface for compatibility
export const useDashboard = () => {
  return useDashboardData();
};
