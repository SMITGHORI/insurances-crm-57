
/**
 * Recent Activities API service for backend integration
 * Fully integrated with MongoDB/Node.js/Express backend
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api';
import { toast } from 'sonner';

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
   * Make HTTP request with error handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
      ...options,
    };

    try {
      console.log(`Making MongoDB request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('MongoDB response received:', data);
      return data;
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all activities with filtering and pagination from MongoDB
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
        activities: response.data?.activities || response.activities || [],
        total: response.data?.pagination?.totalCount || response.total || 0,
        page: response.data?.pagination?.currentPage || response.page || 1,
        totalPages: response.data?.pagination?.totalPages || response.totalPages || 1,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch activities from MongoDB:', error);
      toast.error('Failed to load activities from database');
      throw error;
    }
  }

  /**
   * Get activity by ID from MongoDB
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
      console.error('Failed to fetch activity from MongoDB:', error);
      toast.error('Failed to load activity details');
      throw error;
    }
  }

  /**
   * Create new activity in MongoDB
   */
  async createActivity(activityData) {
    try {
      const endpoint = API_ENDPOINTS.ACTIVITIES;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(activityData),
      });
      
      // Trigger real-time update
      window.dispatchEvent(new CustomEvent('activity-created', { detail: response.data }));
      
      return {
        activity: response.data || response,
        success: true
      };
    } catch (error) {
      console.error('Failed to create activity in MongoDB:', error);
      toast.error('Failed to create activity');
      throw error;
    }
  }

  /**
   * Get activity statistics from MongoDB
   */
  async getActivityStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.timeframe) {
        queryParams.append('timeframe', params.timeframe);
      }
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
      console.error('Failed to fetch activity stats from MongoDB:', error);
      toast.error('Failed to load activity statistics');
      throw error;
    }
  }

  /**
   * Search activities in MongoDB
   */
  async searchActivities(query, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/search/${encodeURIComponent(query)}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        activities: response.data || response,
        success: true
      };
    } catch (error) {
      console.error('Failed to search activities in MongoDB:', error);
      toast.error('Failed to search activities');
      throw error;
    }
  }

  /**
   * Get filter values from MongoDB
   */
  async getFilterValues() {
    try {
      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/filters`;
      const response = await this.makeRequest(endpoint);
      
      return {
        filters: response.data || response,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch filter values from MongoDB:', error);
      return {
        filters: {
          types: ['client', 'policy', 'claim', 'lead', 'quotation'],
          users: [],
          entityTypes: []
        },
        success: false
      };
    }
  }

  /**
   * Archive expired activities in MongoDB
   */
  async archiveExpiredActivities() {
    try {
      const endpoint = `${API_ENDPOINTS.ACTIVITIES}/archive-expired`;
      const response = await this.makeRequest(endpoint, {
        method: 'POST'
      });
      
      return {
        archivedCount: response.data?.archivedCount || 0,
        success: true
      };
    } catch (error) {
      console.error('Failed to archive activities in MongoDB:', error);
      toast.error('Failed to archive activities');
      throw error;
    }
  }

  /**
   * Get activities by entity from MongoDB
   */
  async getActivitiesByEntity(entityType, entityId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        entityType,
        entityId,
        ...params
      });

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        activities: response.data?.activities || response.activities || [],
        total: response.data?.pagination?.totalCount || response.total || 0,
        success: true
      };
    } catch (error) {
      console.error(`Failed to fetch ${entityType} activities from MongoDB:`, error);
      throw error;
    }
  }

  /**
   * Get recent activities (last 24 hours) from MongoDB
   */
  async getRecentActivities(limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        dateFilter: 'today',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const endpoint = `${API_ENDPOINTS.ACTIVITIES}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return response.data?.activities || response.activities || [];
    } catch (error) {
      console.error('Failed to fetch recent activities from MongoDB:', error);
      return [];
    }
  }

  /**
   * Real-time activity logging helper
   */
  async logUserActivity(action, entityType, entityId, entityName, details = '') {
    try {
      const activityData = {
        action,
        type: entityType,
        operation: 'create',
        description: `${action} - ${entityType}`,
        details,
        entityType,
        entityId,
        entityName,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName') || 'Unknown User'
      };

      return await this.createActivity(activityData);
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  }
}

// Create and export singleton instance
export const recentActivitiesApi = new RecentActivitiesApi();
export default recentActivitiesApi;
