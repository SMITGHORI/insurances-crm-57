
import { toast } from 'sonner';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for dashboard operations
 * Connects to Node.js + Express + MongoDB backend
 */
class DashboardBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/dashboard`;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data; // Extract data field or return full response
    } catch (error) {
      console.error('Dashboard API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get dashboard overview with real-time data
   */
  async getDashboardOverview() {
    return this.request('/overview');
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    return this.request(`/activities?limit=${limit}`);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(period = '30d') {
    return this.request(`/performance?period=${period}`);
  }

  /**
   * Get charts data for visualization
   */
  async getChartsData(type = 'all') {
    return this.request(`/charts?type=${type}`);
  }

  /**
   * Get quick actions data
   */
  async getQuickActions() {
    return this.request('/quick-actions');
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard() {
    return this.request('/refresh', { method: 'POST' });
  }

  /**
   * Format overview data for frontend consumption
   */
  formatOverviewData(data) {
    return {
      clients: {
        total: data.clients?.total || 0,
        active: data.clients?.active || 0,
        pending: data.clients?.pending || 0,
        trend: data.clients?.trend || '0'
      },
      policies: {
        total: data.policies?.total || 0,
        active: data.policies?.active || 0,
        expiring: data.policies?.expiring || 0,
        trend: data.policies?.trend || '0'
      },
      claims: {
        total: data.claims?.total || 0,
        pending: data.claims?.pending || 0,
        approved: data.claims?.approved || 0,
        trend: data.claims?.trend || '0'
      },
      leads: {
        total: data.leads?.total || 0,
        active: data.leads?.active || 0,
        converted: data.leads?.converted || 0,
        conversionRate: data.leads?.conversionRate || '0',
        trend: data.leads?.trend || '0'
      },
      quotations: {
        total: data.quotations?.total || 0,
        pending: data.quotations?.pending || 0,
        approved: data.quotations?.approved || 0,
        conversionRate: data.quotations?.conversionRate || '0',
        trend: data.quotations?.trend || '0'
      }
    };
  }

  /**
   * Format charts data for recharts consumption
   */
  formatChartsData(data) {
    return {
      revenue: data.revenue || [],
      leadsFunnel: data.leadsFunnel || [],
      claimsStatus: data.claimsStatus || [],
      clientTypes: data.clientTypes || []
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
      },
      pendingClients: {
        count: data.pendingClients?.count || 0,
        items: data.pendingClients?.items || []
      }
    };
  }
}

// Export singleton instance
export const dashboardBackendApi = new DashboardBackendApiService();
export default dashboardBackendApi;
