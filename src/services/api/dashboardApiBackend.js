
import { toast } from 'sonner';

// Base API configuration for dashboard operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * MongoDB-connected Dashboard API backend service
 * All demo data removed - using real database operations
 */
class DashboardApiBackendService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard`;
  }

  /**
   * Generic API request handler with MongoDB connection
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('Making MongoDB dashboard request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('MongoDB dashboard response received:', responseData);
      return responseData;
    } catch (error) {
      console.error('MongoDB Dashboard API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get dashboard overview from MongoDB
   */
  async getDashboardOverview() {
    const response = await this.request('/overview');
    return response.data;
  }

  /**
   * Get recent activities from MongoDB
   */
  async getRecentActivities(limit = 10) {
    const response = await this.request(`/activities?limit=${limit}`);
    return response.data;
  }

  /**
   * Get performance metrics from MongoDB
   */
  async getPerformanceMetrics(period = '30d') {
    const response = await this.request(`/performance?period=${period}`);
    return response.data;
  }

  /**
   * Get charts data from MongoDB
   */
  async getChartsData(type = 'all') {
    const response = await this.request(`/charts?type=${type}`);
    return response.data;
  }

  /**
   * Get quick actions from MongoDB
   */
  async getQuickActions() {
    const response = await this.request('/quick-actions');
    return response.data;
  }

  /**
   * Format overview data for display
   */
  formatOverviewData(data) {
    return {
      clients: {
        total: data.clients?.total || 0,
        active: data.clients?.active || 0,
        trend: data.clients?.trend || '0%'
      },
      policies: {
        total: data.policies?.total || 0,
        active: data.policies?.active || 0,
        trend: data.policies?.trend || '0%'
      },
      claims: {
        total: data.claims?.total || 0,
        pending: data.claims?.pending || 0,
        trend: data.claims?.trend || '0%'
      },
      leads: {
        total: data.leads?.total || 0,
        active: data.leads?.active || 0,
        conversionRate: data.leads?.conversionRate || '0%',
        trend: data.leads?.trend || '0%'
      },
      quotations: {
        total: data.quotations?.total || 0,
        pending: data.quotations?.pending || 0,
        conversionRate: data.quotations?.conversionRate || '0%',
        trend: data.quotations?.trend || '0%'
      }
    };
  }

  /**
   * Format charts data for visualization
   */
  formatChartsData(data) {
    return {
      revenue: data.revenue || [],
      leadsFunnel: data.leadsFunnel || [],
      claimsStatus: data.claimsStatus || [],
      policyTypes: data.policyTypes || [],
      monthlyGrowth: data.monthlyGrowth || []
    };
  }

  /**
   * Format quick actions data
   */
  formatQuickActionsData(data) {
    return {
      pendingClaims: {
        count: data.pendingClaims?.count || 0,
        items: data.pendingClaims?.items || []
      },
      expiringPolicies: {
        count: data.expiringPolicies?.count || 0,
        items: data.expiringPolicies?.items || []
      },
      overdueLeads: {
        count: data.overdueLeads?.count || 0,
        items: data.overdueLeads?.items || []
      },
      pendingQuotations: {
        count: data.pendingQuotations?.count || 0,
        items: data.pendingQuotations?.items || []
      }
    };
  }
}

// Export singleton instance
export const dashboardBackendApi = new DashboardApiBackendService();
export default dashboardBackendApi;
