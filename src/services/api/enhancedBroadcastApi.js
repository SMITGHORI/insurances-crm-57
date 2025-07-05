
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Enhanced Broadcast API Service
 * Handles all broadcast-related API operations
 */
class EnhancedBroadcastApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && token !== 'demo-token-admin' && token !== 'demo-token-agent' && {
        'Authorization': `Bearer ${token}`
      })
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config = {
      headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Enhanced Broadcast API Request failed:', error);
      throw error;
    }
  }

  async getBroadcasts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BROADCASTS}?${queryString}` : API_ENDPOINTS.BROADCASTS;
    return this.makeRequest(endpoint);
  }

  async getBroadcastById(broadcastId) {
    return this.makeRequest(API_ENDPOINTS.BROADCAST_BY_ID(broadcastId));
  }

  async createBroadcast(broadcastData) {
    return this.makeRequest(API_ENDPOINTS.BROADCASTS, {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    });
  }

  async updateBroadcast(broadcastId, broadcastData) {
    return this.makeRequest(API_ENDPOINTS.BROADCAST_BY_ID(broadcastId), {
      method: 'PUT',
      body: JSON.stringify(broadcastData)
    });
  }

  async deleteBroadcast(broadcastId) {
    return this.makeRequest(API_ENDPOINTS.BROADCAST_BY_ID(broadcastId), {
      method: 'DELETE'
    });
  }

  async getBroadcastAnalytics(broadcastId) {
    return this.makeRequest(`${API_ENDPOINTS.BROADCAST_BY_ID(broadcastId)}/analytics`);
  }

  async approveBroadcast(broadcastId, action, reason = '') {
    return this.makeRequest(`${API_ENDPOINTS.BROADCAST_BY_ID(broadcastId)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BROADCASTS}/templates?${queryString}` : `${API_ENDPOINTS.BROADCASTS}/templates`;
    return this.makeRequest(endpoint);
  }

  async createTemplate(templateData) {
    return this.makeRequest(`${API_ENDPOINTS.BROADCASTS}/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  async getEligibleClients(targetAudience) {
    return this.makeRequest(`${API_ENDPOINTS.BROADCASTS}/eligible-clients`, {
      method: 'POST',
      body: JSON.stringify(targetAudience)
    });
  }

  async updateClientPreferences(clientId, preferences) {
    return this.makeRequest(`${API_ENDPOINTS.CLIENTS}/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  async triggerAutomation(triggerType) {
    return this.makeRequest(`${API_ENDPOINTS.BROADCASTS}/automation/${triggerType}`, {
      method: 'POST'
    });
  }

  async getBroadcastStats(broadcastId) {
    return this.makeRequest(`${API_ENDPOINTS.BROADCAST_BY_ID(broadcastId)}/stats`);
  }
}

export const enhancedBroadcastApi = new EnhancedBroadcastApiService();
