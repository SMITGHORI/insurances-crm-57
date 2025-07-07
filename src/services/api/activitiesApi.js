
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Activities API Service with MongoDB Integration
 */
class ActivitiesApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.ACTIVITIES);
  }

  async getActivities(params = {}) {
    return this.getAll(params);
  }

  async getActivityById(activityId) {
    return this.getById(activityId);
  }

  async createActivity(activityData) {
    return this.create(activityData);
  }

  async updateActivity(activityId, activityData) {
    return this.update(activityId, activityData);
  }

  async deleteActivity(activityId) {
    return this.delete(activityId);
  }

  async getActivitiesByUser(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/user/${userId}?${queryString}` : `/user/${userId}`;
    return this.makeRequest(endpoint);
  }

  async getActivitiesByEntity(entityType, entityId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/entity/${entityType}/${entityId}?${queryString}` : `/entity/${entityType}/${entityId}`;
    return this.makeRequest(endpoint);
  }

  async logActivity(activityData) {
    return this.makeRequest('/log', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  }
}

export const activitiesApi = new ActivitiesApiService();
export default activitiesApi;
