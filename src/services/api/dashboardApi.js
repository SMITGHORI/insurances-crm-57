
import dashboardBackendApi from './dashboardApiBackend';

/**
 * Real-time dashboard API service
 */
class DashboardApiService {
  constructor() {
    this.backendApi = dashboardBackendApi;
  }

  /**
   * Get dashboard overview with real-time data
   */
  async getDashboardOverview() {
    try {
      const data = await this.backendApi.getDashboardOverview();
      return this.backendApi.formatOverviewData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      return await this.backendApi.getRecentActivities(limit);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(period = '30d') {
    try {
      return await this.backendApi.getPerformanceMetrics(period);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get charts data for visualization
   */
  async getChartsData(type = 'all') {
    try {
      const data = await this.backendApi.getChartsData(type);
      return this.backendApi.formatChartsData(data);
    } catch (error) {
      console.error('Failed to fetch charts data:', error);
      throw error;
    }
  }

  /**
   * Get quick actions data
   */
  async getQuickActions() {
    try {
      const data = await this.backendApi.getQuickActions();
      return this.backendApi.formatQuickActionsData(data);
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      throw error;
    }
  }

  /**
   * Refresh all dashboard data
   */
  async refreshDashboard() {
    try {
      const [overview, activities, metrics, charts, quickActions] = await Promise.all([
        this.getDashboardOverview(),
        this.getRecentActivities(10),
        this.getPerformanceMetrics('30d'),
        this.getChartsData('all'),
        this.getQuickActions()
      ]);

      return {
        overview,
        activities,
        metrics,
        charts,
        quickActions,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      throw error;
    }
  }
}

export const dashboardApi = new DashboardApiService();
export default dashboardApi;
