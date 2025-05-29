
/**
 * Recent Activities API service for backend integration
 * Optimized for MongoDB/Node.js/Express backend
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api';

class RecentActivitiesApi {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.isOfflineMode = false;
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      
      this.isOfflineMode = !response.ok;
      return response.ok;
    } catch (error) {
      console.log('Backend not available, using offline mode');
      this.isOfflineMode = true;
      return false;
    }
  }

  /**
   * Get sample activities data (offline fallback)
   */
  getSampleData() {
    const stored = localStorage.getItem('activitiesData');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Sample activities data
    const sampleData = [
      {
        id: '1',
        action: 'New client registered',
        client: 'Vivek Patel',
        clientId: '12',
        time: '2025-05-20T10:30:00',
        timestamp: '2 hours ago',
        type: 'client',
        agent: 'Rahul Sharma',
        agentId: '3',
        details: 'Client registered with email vivek.patel@email.com',
        createdAt: '2025-05-20T10:30:00',
        updatedAt: '2025-05-20T10:30:00'
      },
      {
        id: '2',
        action: 'Policy issued',
        client: 'Priya Desai',
        clientId: '8',
        time: '2025-05-20T08:15:00',
        timestamp: '4 hours ago',
        type: 'policy',
        agent: 'Neha Gupta',
        agentId: '5',
        policyNumber: 'POL-2025-0042',
        policyId: '42',
        details: 'Health insurance policy issued',
        createdAt: '2025-05-20T08:15:00',
        updatedAt: '2025-05-20T08:15:00'
      },
      {
        id: '3',
        action: 'Claim approved',
        client: 'Arjun Singh',
        clientId: '15',
        time: '2025-05-20T07:25:00',
        timestamp: '5 hours ago',
        type: 'claim',
        agent: 'Rahul Sharma',
        agentId: '3',
        claimId: '28',
        claimNumber: 'CLM-2025-0028',
        details: 'Claim approved for ₹45,000',
        createdAt: '2025-05-20T07:25:00',
        updatedAt: '2025-05-20T07:25:00'
      }
    ];
    
    localStorage.setItem('activitiesData', JSON.stringify(sampleData));
    return sampleData;
  }

  /**
   * Make HTTP request with error handling
   */
  async makeRequest(endpoint, options = {}) {
    // Check backend availability first
    if (!await this.checkBackendHealth()) {
      throw new Error('Backend unavailable - using offline mode');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all activities with filtering and pagination
   */
  async getActivities(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 50);
      
      // Add filtering
      if (params.type && params.type !== 'all') {
        queryParams.append('type', params.type);
      }
      if (params.agentId && params.agentId !== 'all') {
        queryParams.append('agentId', params.agentId);
      }
      if (params.clientId && params.clientId !== 'all') {
        queryParams.append('clientId', params.clientId);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      // Add date filtering
      if (params.dateFilter && params.dateFilter !== 'all') {
        queryParams.append('dateFilter', params.dateFilter);
      }
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        activities: response.data || response.activities || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        success: true
      };
    } catch (error) {
      console.log('API not available, using offline mode with sample data');
      this.isOfflineMode = true;
      
      const sampleActivities = this.getSampleData();
      
      return {
        activities: sampleActivities,
        total: sampleActivities.length,
        page: 1,
        totalPages: 1,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId) {
    try {
      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/${activityId}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        activity: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, using offline mode');
      this.isOfflineMode = true;
      
      const sampleActivities = this.getSampleData();
      const activity = sampleActivities.find(act => act.id === activityId);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      return {
        activity,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Create new activity
   */
  async createActivity(activityData) {
    try {
      const endpoint = API_ENDPOINTS.ACTIVITIES;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(activityData),
      });
      
      return {
        activity: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, creating activity in offline mode');
      this.isOfflineMode = true;
      
      // Create activity locally
      const newActivity = {
        id: `ACT_${Date.now()}`,
        ...activityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const existingActivities = this.getSampleData();
      const updatedActivities = [newActivity, ...existingActivities];
      localStorage.setItem('activitiesData', JSON.stringify(updatedActivities));
      
      return {
        activity: newActivity,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      if (params.agentId) {
        queryParams.append('agentId', params.agentId);
      }

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/stats?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        stats: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, calculating stats from sample data');
      this.isOfflineMode = true;
      
      const sampleActivities = this.getSampleData();
      
      // Calculate basic stats
      const stats = {
        total: sampleActivities.length,
        clients: sampleActivities.filter(act => act.type === 'client').length,
        policies: sampleActivities.filter(act => act.type === 'policy').length,
        claims: sampleActivities.filter(act => act.type === 'claim').length,
        leads: sampleActivities.filter(act => act.type === 'lead').length,
        today: sampleActivities.filter(act => {
          const today = new Date().toDateString();
          return new Date(act.time).toDateString() === today;
        }).length,
      };
      
      return {
        stats,
        success: true,
        offline: true
      };
    }
  }
}

// Create and export singleton instance
export const recentActivitiesApi = new RecentActivitiesApi();
export default recentActivitiesApi;
