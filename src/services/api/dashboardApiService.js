
import { toast } from 'sonner';

// Base API configuration for dashboard operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Enhanced Dashboard API Service with proper MongoDB integration
 * Handles real-time data fetching from all modules
 */
class DashboardApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard`;
    this.abortController = null;
  }

  /**
   * Generic API request handler with enhanced error handling
   */
  async request(endpoint, options = {}) {
    // Abort previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: this.abortController.signal,
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('Dashboard API request:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Dashboard API response:', responseData);
      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Dashboard API request aborted');
        return null;
      }
      console.error('Dashboard API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get dashboard overview with real-time data from all modules
   */
  async getDashboardOverview() {
    try {
      const response = await this.request('/overview');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error);
      toast.error('Failed to load dashboard overview');
      throw error;
    }
  }

  /**
   * Get recent activities from all modules
   */
  async getRecentActivities(limit = 10) {
    try {
      const response = await this.request(`/activities?limit=${limit}`);
      return {
        success: true,
        data: response.data || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      toast.error('Failed to load recent activities');
      throw error;
    }
  }

  /**
   * Get performance metrics with real-time calculations
   */
  async getPerformanceMetrics(period = '30d') {
    try {
      const response = await this.request(`/performance?period=${period}`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      toast.error('Failed to load performance metrics');
      throw error;
    }
  }

  /**
   * Get charts data for visualization from all modules
   */
  async getChartsData(type = 'all') {
    try {
      const response = await this.request(`/charts?type=${type}`);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch charts data:', error);
      toast.error('Failed to load charts data');
      throw error;
    }
  }

  /**
   * Get quick actions from all modules
   */
  async getQuickActions() {
    try {
      const response = await this.request('/quick-actions');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      toast.error('Failed to load quick actions');
      throw error;
    }
  }

  /**
   * Refresh all dashboard data
   */
  async refreshDashboard() {
    try {
      const response = await this.request('/refresh', { method: 'POST' });
      return {
        success: true,
        message: 'Dashboard refreshed successfully',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      toast.error('Failed to refresh dashboard');
      throw error;
    }
  }

  /**
   * Get aggregated stats from all modules
   */
  async getAggregatedStats() {
    try {
      const [overview, metrics, activities, quickActions] = await Promise.allSettled([
        this.getDashboardOverview(),
        this.getPerformanceMetrics('30d'),
        this.getRecentActivities(5),
        this.getQuickActions()
      ]);

      return {
        overview: overview.status === 'fulfilled' ? overview.value.data : null,
        metrics: metrics.status === 'fulfilled' ? metrics.value.data : null,
        activities: activities.status === 'fulfilled' ? activities.value.data : [],
        quickActions: quickActions.status === 'fulfilled' ? quickActions.value.data : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch aggregated stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();
export default dashboardApiService;
