
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

/**
 * Backend API service for activities operations
 * Connects to Node.js + Express + MongoDB backend
 */
class ActivitiesBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ACTIVITIES}`;
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
      console.error('API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all activities with filtering and pagination
   */
  async getActivities(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.entityType && params.entityType !== 'all') queryParams.append('entityType', params.entityType);
    if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);
    if (params.clientId && params.clientId !== 'all') queryParams.append('clientId', params.clientId);
    if (params.userId && params.userId !== 'all') queryParams.append('userId', params.userId);
    if (params.entityId) queryParams.append('entityId', params.entityId);
    if (params.priority && params.priority !== 'all') queryParams.append('priority', params.priority);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    
    // Add sorting parameters
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Add date range parameters
    if (params.dateFilter && params.dateFilter !== 'all') queryParams.append('dateFilter', params.dateFilter);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.isRecent !== undefined) queryParams.append('isRecent', params.isRecent);

    // Add tags filter
    if (params.tags) queryParams.append('tags', params.tags);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      activities: response.data.activities,
      totalCount: response.data.pagination.totalCount,
      pagination: response.data.pagination,
      success: true
    };
  }

  /**
   * Get a single activity by ID
   */
  async getActivityById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new activity
   */
  async createActivity(activityData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });

    return response.data;
  }

  /**
   * Update an existing activity
   */
  async updateActivity(id, activityData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });

    return response.data;
  }

  /**
   * Delete an activity (soft delete)
   */
  async deleteActivity(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.agentId) queryParams.append('agentId', params.agentId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.period) queryParams.append('period', params.period);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Search activities
   */
  async searchActivities(query, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);

    const queryString = queryParams.toString();
    const endpoint = `/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Perform bulk actions on activities
   */
  async bulkActions(activityIds, action, value = null) {
    const bulkData = {
      activityIds,
      action
    };

    if (value !== null) {
      bulkData.value = value;
    }

    const response = await this.request('/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });

    return response.data;
  }

  /**
   * Archive multiple activities
   */
  async archiveActivities(activityIds) {
    return this.bulkActions(activityIds, 'archive');
  }

  /**
   * Hide multiple activities
   */
  async hideActivities(activityIds) {
    return this.bulkActions(activityIds, 'hide');
  }

  /**
   * Show multiple activities
   */
  async showActivities(activityIds) {
    return this.bulkActions(activityIds, 'show');
  }

  /**
   * Add tag to multiple activities
   */
  async addTagToActivities(activityIds, tag) {
    return this.bulkActions(activityIds, 'addTag', tag);
  }

  /**
   * Remove tag from multiple activities
   */
  async removeTagFromActivities(activityIds, tag) {
    return this.bulkActions(activityIds, 'removeTag', tag);
  }

  /**
   * Change priority of multiple activities
   */
  async changePriorityOfActivities(activityIds, priority) {
    return this.bulkActions(activityIds, 'changePriority', priority);
  }

  /**
   * Get activities by entity
   */
  async getActivitiesByEntity(entityType, entityId, params = {}) {
    const queryParams = {
      ...params,
      entityType,
      entityId
    };
    
    return this.getActivities(queryParams);
  }

  /**
   * Get activities by agent
   */
  async getActivitiesByAgent(agentId, params = {}) {
    const queryParams = {
      ...params,
      agentId
    };
    
    return this.getActivities(queryParams);
  }

  /**
   * Get activities by client
   */
  async getActivitiesByClient(clientId, params = {}) {
    const queryParams = {
      ...params,
      clientId
    };
    
    return this.getActivities(queryParams);
  }

  /**
   * Get recent activities (last 24 hours)
   */
  async getRecentActivities(params = {}) {
    const queryParams = {
      ...params,
      isRecent: true
    };
    
    return this.getActivities(queryParams);
  }

  /**
   * Create activity with automatic metadata
   */
  async createActivityWithMetadata(basicData, metadata = {}) {
    const activityData = {
      ...basicData,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    return this.createActivity(activityData);
  }

  /**
   * Helper method to create specific activity types
   */
  async createClientActivity(action, clientId, clientName, details = '') {
    return this.createActivity({
      action,
      type: 'client',
      description: `Client activity: ${action}`,
      details,
      entityType: 'client',
      entityId: clientId,
      entityName: clientName,
      clientId,
      clientName
    });
  }

  async createPolicyActivity(action, policyId, policyNumber, clientId, clientName, details = '') {
    return this.createActivity({
      action,
      type: 'policy',
      description: `Policy activity: ${action}`,
      details,
      entityType: 'policy',
      entityId: policyId,
      entityName: policyNumber,
      clientId,
      clientName,
      metadata: {
        policyId,
        policyNumber
      }
    });
  }

  async createClaimActivity(action, claimId, claimNumber, clientId, clientName, details = '') {
    return this.createActivity({
      action,
      type: 'claim',
      description: `Claim activity: ${action}`,
      details,
      entityType: 'claim',
      entityId: claimId,
      entityName: claimNumber,
      clientId,
      clientName,
      metadata: {
        claimId,
        claimNumber
      }
    });
  }

  async createQuotationActivity(action, quotationId, quoteId, clientId, clientName, details = '') {
    return this.createActivity({
      action,
      type: 'quotation',
      description: `Quotation activity: ${action}`,
      details,
      entityType: 'quotation',
      entityId: quotationId,
      entityName: quoteId,
      clientId,
      clientName,
      metadata: {
        quotationId,
        quoteId
      }
    });
  }

  async createLeadActivity(action, leadId, leadName, details = '') {
    return this.createActivity({
      action,
      type: 'lead',
      description: `Lead activity: ${action}`,
      details,
      entityType: 'lead',
      entityId: leadId,
      entityName: leadName,
      metadata: {
        leadId
      }
    });
  }
}

// Export singleton instance
export const activitiesBackendApi = new ActivitiesBackendApiService();
export default activitiesBackendApi;
