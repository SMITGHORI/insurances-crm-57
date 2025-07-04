
import dashboardBackendApi from './dashboardApiBackend';

/**
 * Real-time dashboard API service connected to MongoDB
 * Removes all demo data and connects to backend database
 */
class DashboardApiService {
  constructor() {
    this.backendApi = dashboardBackendApi;
  }

  /**
   * Get dashboard overview with real-time data from MongoDB
   */
  async getDashboardOverview() {
    try {
      console.log('Fetching dashboard overview from MongoDB');
      const data = await this.backendApi.getDashboardOverview();
      return this.backendApi.formatOverviewData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard overview from MongoDB:', error);
      // Return empty structure instead of demo data
      return {
        clients: { total: 0, active: 0, trend: '0%' },
        policies: { total: 0, active: 0, trend: '0%' },
        claims: { total: 0, pending: 0, trend: '0%' },
        leads: { total: 0, active: 0, conversionRate: '0%', trend: '0%' },
        quotations: { total: 0, pending: 0, conversionRate: '0%', trend: '0%' }
      };
    }
  }

  /**
   * Get recent activities from MongoDB
   */
  async getRecentActivities(limit = 10) {
    try {
      console.log('Fetching recent activities from MongoDB');
      return await this.backendApi.getRecentActivities(limit);
    } catch (error) {
      console.error('Failed to fetch recent activities from MongoDB:', error);
      return [];
    }
  }

  /**
   * Get performance metrics from MongoDB
   */
  async getPerformanceMetrics(period = '30d') {
    try {
      console.log('Fetching performance metrics from MongoDB');
      return await this.backendApi.getPerformanceMetrics(period);
    } catch (error) {
      console.error('Failed to fetch performance metrics from MongoDB:', error);
      return {
        period,
        newClients: 0,
        newPolicies: 0,
        newClaims: 0,
        newLeads: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        communicationsSent: 0,
        upcomingTasks: 0
      };
    }
  }

  /**
   * Get charts data for visualization from MongoDB
   */
  async getChartsData(type = 'all') {
    try {
      console.log('Fetching charts data from MongoDB');
      const data = await this.backendApi.getChartsData(type);
      return this.backendApi.formatChartsData(data);
    } catch (error) {
      console.error('Failed to fetch charts data from MongoDB:', error);
      return {
        revenue: [],
        leadsFunnel: [],
        claimsStatus: [],
        policyTypes: [],
        monthlyGrowth: []
      };
    }
  }

  /**
   * Get quick actions data from MongoDB
   */
  async getQuickActions() {
    try {
      console.log('Fetching quick actions from MongoDB');
      const data = await this.backendApi.getQuickActions();
      return this.backendApi.formatQuickActionsData(data);
    } catch (error) {
      console.error('Failed to fetch quick actions from MongoDB:', error);
      return {
        pendingClaims: { count: 0, items: [] },
        expiringPolicies: { count: 0, items: [] },
        overdueLeads: { count: 0, items: [] },
        pendingQuotations: { count: 0, items: [] }
      };
    }
  }

  /**
   * Refresh all dashboard data from MongoDB
   */
  async refreshDashboard() {
    try {
      console.log('Refreshing all dashboard data from MongoDB');
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
      console.error('Failed to refresh dashboard from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Listen for real-time updates from other modules
   */
  subscribeToModuleUpdates(callback) {
    const events = [
      'client-updated',
      'policy-updated', 
      'claim-updated',
      'lead-updated',
      'quotation-updated',
      'offer-updated',
      'broadcast-sent'
    ];

    events.forEach(event => {
      window.addEventListener(event, () => {
        console.log(`Dashboard received ${event} event, refreshing data`);
        callback();
      });
    });
  }

  /**
   * Trigger dashboard refresh from other modules
   */
  triggerRefresh() {
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
  }
}

export const dashboardApi = new DashboardApiService();
export default dashboardApi;
