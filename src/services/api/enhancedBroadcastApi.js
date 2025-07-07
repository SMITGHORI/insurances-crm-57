
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Enhanced Broadcast API Service with MongoDB Integration
 */
class EnhancedBroadcastApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.BROADCASTS);
  }

  async getBroadcasts(params = {}) {
    return this.getAll(params);
  }

  async getBroadcastById(broadcastId) {
    return this.getById(broadcastId);
  }

  async createBroadcast(broadcastData) {
    return this.create(broadcastData);
  }

  async updateBroadcast(broadcastId, broadcastData) {
    return this.update(broadcastId, broadcastData);
  }

  async deleteBroadcast(broadcastId) {
    return this.delete(broadcastId);
  }

  async getBroadcastAnalytics(broadcastId) {
    return this.makeRequest(`/${broadcastId}/analytics`);
  }

  async approveBroadcast(broadcastId, action, reason = '') {
    return this.makeRequest(`/${broadcastId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/templates?${queryString}` : '/templates';
    return this.makeRequest(endpoint);
  }

  async createTemplate(templateData) {
    return this.makeRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  async getEligibleClients(targetAudience) {
    return this.makeRequest('/eligible-clients', {
      method: 'POST',
      body: JSON.stringify(targetAudience)
    });
  }

  async updateClientPreferences(clientId, preferences) {
    return this.makeRequest(`/clients/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  async triggerAutomation(triggerType) {
    return this.makeRequest(`/automation/${triggerType}`, {
      method: 'POST'
    });
  }

  async getBroadcastStats(broadcastId) {
    return this.makeRequest(`/${broadcastId}/stats`);
  }
}

export const enhancedBroadcastApi = new EnhancedBroadcastApiService();
export default enhancedBroadcastApi;
