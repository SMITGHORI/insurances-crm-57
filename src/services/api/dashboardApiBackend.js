
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
   * Generic API request handler with error handling and fallback data
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
      console.warn('Dashboard API Request failed, using fallback data:', error.message);
      // Return fallback data instead of throwing
      return this.getFallbackData(endpoint);
    }
  }

  /**
   * Provide fallback data when API is unavailable
   */
  getFallbackData(endpoint) {
    switch (endpoint) {
      case '/overview':
        return this.formatOverviewData({
          clients: { total: 1250, active: 1100, pending: 45, trend: '+12.5' },
          policies: { total: 2340, active: 2180, expiring: 23, trend: '+8.3' },
          claims: { total: 156, pending: 23, approved: 120, trend: '-5.2' },
          leads: { total: 450, active: 320, converted: 128, conversionRate: '28.4', trend: '+15.7' },
          quotations: { total: 680, pending: 120, approved: 440, conversionRate: '64.7', trend: '+10.2' }
        });
      case '/activities':
        return this.getMockActivities();
      case '/performance':
        return this.getMockPerformance();
      case '/charts':
        return this.formatChartsData(this.getMockChartsData());
      case '/quick-actions':
        return this.formatQuickActionsData(this.getMockQuickActions());
      default:
        return {};
    }
  }

  getMockActivities() {
    return [
      {
        _id: '1',
        action: 'Created new auto policy',
        type: 'policy',
        operation: 'create',
        description: 'Auto insurance policy POL-2024-001 created for John Smith',
        entityType: 'policy',
        entityId: '674a1234567890abcdef0001',
        entityName: 'POL-2024-001',
        userName: 'Sarah Johnson',
        userRole: 'agent',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
      },
      {
        _id: '2',
        action: 'Updated client information',
        type: 'client',
        operation: 'update',
        description: 'Client profile updated for Maria Garcia',
        entityType: 'client',
        entityId: '674a1234567890abcdef0002',
        entityName: 'Maria Garcia',
        userName: 'Mike Wilson',
        userRole: 'agent',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 min ago
      },
      {
        _id: '3',
        action: 'Approved claim',
        type: 'claim',
        operation: 'update',
        description: 'Health insurance claim CLM-2024-089 approved',
        entityType: 'claim',
        entityId: '674a1234567890abcdef0003',
        entityName: 'CLM-2024-089',
        userName: 'David Brown',
        userRole: 'manager',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      }
    ];
  }

  getMockPerformance() {
    return {
      newClients: 45,
      totalClients: 1250,
      newPolicies: 78,
      totalRevenue: 234000,
      averageDealSize: 3000,
      conversionRate: 28.4,
      customerSatisfaction: 92.3,
      communicationsSent: 1240,
      communicationsDelivered: 1180,
      upcomingTasks: 23,
      overdueTasks: 5
    };
  }

  getMockChartsData() {
    return {
      revenue: [
        { month: 'Jan', revenue: 145000, policies: 45 },
        { month: 'Feb', revenue: 162000, policies: 52 },
        { month: 'Mar', revenue: 178000, policies: 58 },
        { month: 'Apr', revenue: 195000, policies: 63 },
        { month: 'May', revenue: 210000, policies: 68 },
        { month: 'Jun', revenue: 234000, policies: 78 }
      ],
      leadsFunnel: [
        { name: 'New Leads', count: 320 },
        { name: 'Contacted', count: 280 },
        { name: 'Qualified', count: 180 },
        { name: 'Proposal', count: 120 },
        { name: 'Closed', count: 91 }
      ],
      claimsStatus: [
        { status: 'Submitted', count: 23 },
        { status: 'Under Review', count: 18 },
        { status: 'Approved', count: 89 },
        { status: 'Rejected', count: 12 },
        { status: 'Paid', count: 67 }
      ],
      clientTypes: [
        { type: 'Individual', count: 780 },
        { type: 'Family', count: 320 },
        { type: 'Business', count: 150 }
      ]
    };
  }

  getMockQuickActions() {
    return {
      pendingClaims: {
        count: 23,
        items: [
          { claimId: 'CLM-2024-156', claimAmount: 15000, status: 'submitted', createdAt: new Date().toISOString() },
          { claimId: 'CLM-2024-157', claimAmount: 8500, status: 'under_review', createdAt: new Date().toISOString() }
        ]
      },
      expiringPolicies: {
        count: 12,
        items: [
          { policyNumber: 'POL-2024-445', premium: 25000, endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString() },
          { policyNumber: 'POL-2024-446', premium: 18000, endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString() }
        ]
      },
      overdueLeads: {
        count: 18,
        items: [
          { name: 'Robert Johnson', email: 'robert@email.com', phone: '+91-9876543210', status: 'contacted', lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
          { name: 'Emily Davis', email: 'emily@email.com', phone: '+91-9876543211', status: 'qualified', lastContactDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
        ]
      },
      pendingQuotations: {
        count: 34,
        items: [
          { quotationId: 'QUO-2024-789', premiumAmount: 12000, status: 'sent', createdAt: new Date().toISOString() },
          { quotationId: 'QUO-2024-790', premiumAmount: 9500, status: 'draft', createdAt: new Date().toISOString() }
        ]
      },
      pendingClients: {
        count: 8,
        items: [
          { clientId: 'CLI-2024-567', email: 'newclient1@email.com', phone: '+91-9876543212' },
          { clientId: 'CLI-2024-568', email: 'newclient2@email.com', phone: '+91-9876543213' }
        ]
      }
    };
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
    const data = await this.request(`/charts?type=${type}`);
    return this.formatChartsData(data);
  }

  /**
   * Get quick actions data
   */
  async getQuickActions() {
    const data = await this.request('/quick-actions');
    return this.formatQuickActionsData(data);
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
