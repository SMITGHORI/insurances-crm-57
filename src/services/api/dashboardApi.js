
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Dashboard API Service with MongoDB Integration
 */
class DashboardApiService extends MongoDBApiService {
  constructor() {
    super('/dashboard');
  }

  async getDashboardStats() {
    return this.makeRequest('/stats');
  }

  async getRecentActivities(limit = 10) {
    return this.makeRequest(`/activities?limit=${limit}`);
  }

  async getPerformanceMetrics(period = '30d') {
    return this.makeRequest(`/performance?period=${period}`);
  }

  async getChartsData(type = 'all') {
    return this.makeRequest(`/charts?type=${type}`);
  }

  async getQuickActions() {
    return this.makeRequest('/quick-actions');
  }

  async getOverviewData() {
    return this.makeRequest('/overview');
  }
}

export const dashboardApi = new DashboardApiService();
export default dashboardApi;
