
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

/**
 * Backend API service for dashboard data operations
 */
class DashboardBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/dashboard`;
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
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Dashboard API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get dashboard overview statistics
   */
  async getDashboardOverview() {
    const response = await this.request('/overview');
    return response.data;
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    const response = await this.request(`/activities?limit=${limit}`);
    return response.data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(period = '30d') {
    const response = await this.request(`/performance?period=${period}`);
    return response.data;
  }

  /**
   * Get charts data
   */
  async getChartsData(type = 'all') {
    const response = await this.request(`/charts?type=${type}`);
    return response.data;
  }

  /**
   * Get quick actions data
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
      ...data,
      clients: {
        ...data.clients,
        growthRate: this.parseGrowthRate(data.clients.trend),
        activePercentage: data.clients.total > 0 
          ? ((data.clients.active / data.clients.total) * 100).toFixed(1)
          : 0
      },
      policies: {
        ...data.policies,
        growthRate: this.parseGrowthRate(data.policies.trend),
        activePercentage: data.policies.total > 0 
          ? ((data.policies.active / data.policies.total) * 100).toFixed(1)
          : 0
      },
      claims: {
        ...data.claims,
        growthRate: this.parseGrowthRate(data.claims.trend),
        pendingPercentage: data.claims.total > 0 
          ? ((data.claims.pending / data.claims.total) * 100).toFixed(1)
          : 0
      },
      leads: {
        ...data.leads,
        growthRate: this.parseGrowthRate(data.leads.trend),
        activePercentage: data.leads.total > 0 
          ? ((data.leads.active / data.leads.total) * 100).toFixed(1)
          : 0
      },
      quotations: {
        ...data.quotations,
        growthRate: this.parseGrowthRate(data.quotations.trend),
        pendingPercentage: data.quotations.total > 0 
          ? ((data.quotations.pending / data.quotations.total) * 100).toFixed(1)
          : 0
      }
    };
  }

  /**
   * Format charts data for display
   */
  formatChartsData(data) {
    const formatted = { ...data };
    
    if (data.revenue) {
      formatted.revenue = data.revenue.map(item => ({
        ...item,
        monthName: this.getMonthName(item.month),
        formattedRevenue: this.formatCurrency(item.revenue)
      }));
    }
    
    if (data.leadsFunnel) {
      formatted.leadsFunnel = data.leadsFunnel.map(item => ({
        ...item,
        statusLabel: this.getStatusLabel(item.status),
        percentage: this.calculatePercentage(item.count, data.leadsFunnel)
      }));
    }
    
    if (data.claimsStatus) {
      formatted.claimsStatus = data.claimsStatus.map(item => ({
        ...item,
        statusLabel: this.getStatusLabel(item.status),
        formattedAmount: this.formatCurrency(item.amount)
      }));
    }
    
    return formatted;
  }

  /**
   * Format quick actions data
   */
  formatQuickActionsData(data) {
    return {
      pendingClaims: {
        ...data.pendingClaims,
        items: data.pendingClaims.items.map(item => ({
          ...item,
          formattedAmount: this.formatCurrency(item.claimAmount),
          timeAgo: this.getTimeAgo(item.createdAt)
        }))
      },
      expiringPolicies: {
        ...data.expiringPolicies,
        items: data.expiringPolicies.items.map(item => ({
          ...item,
          formattedPremium: this.formatCurrency(item.premium),
          daysUntilExpiry: this.getDaysUntilExpiry(item.endDate)
        }))
      },
      overdueLeads: {
        ...data.overdueLeads,
        items: data.overdueLeads.items.map(item => ({
          ...item,
          daysSinceContact: this.getDaysSinceContact(item.lastContactDate)
        }))
      },
      pendingQuotations: {
        ...data.pendingQuotations,
        items: data.pendingQuotations.items.map(item => ({
          ...item,
          formattedAmount: this.formatCurrency(item.totalAmount),
          timeAgo: this.getTimeAgo(item.createdAt)
        }))
      }
    };
  }

  /**
   * Parse growth rate string to number
   */
  parseGrowthRate(trend) {
    if (!trend) return 0;
    return parseFloat(trend.replace('%', '').replace('+', ''));
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  /**
   * Get month name from YYYY-MM format
   */
  getMonthName(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /**
   * Get status label
   */
  getStatusLabel(status) {
    const labels = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'draft': 'Draft',
      'sent': 'Sent',
      'active': 'Active'
    };
    return labels[status] || status;
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(value, array) {
    const total = array.reduce((sum, item) => sum + item.count, 0);
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(endDate) {
    const now = new Date();
    const expiry = new Date(endDate);
    const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  /**
   * Get days since contact
   */
  getDaysSinceContact(lastContactDate) {
    const now = new Date();
    const lastContact = new Date(lastContactDate);
    const diffInDays = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));
    return diffInDays;
  }
}

// Export singleton instance
export const dashboardBackendApi = new DashboardBackendApiService();
export default dashboardBackendApi;
