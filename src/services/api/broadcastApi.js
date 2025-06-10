
import { toast } from 'sonner';

// Base API configuration for broadcast operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Broadcast API service for offers and messaging
 */
class BroadcastApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/broadcast`;
  }

  /**
   * Generic API request handler
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
      console.error('Broadcast API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all broadcasts
   */
  async getBroadcasts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination.totalItems,
      totalPages: response.pagination.totalPages,
      currentPage: response.pagination.currentPage,
      success: true
    };
  }

  /**
   * Create new broadcast
   */
  async createBroadcast(broadcastData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });

    return response.data;
  }

  /**
   * Get eligible clients for broadcast
   */
  async getEligibleClients(targetAudience, channels) {
    const response = await this.request('/eligible-clients', {
      method: 'POST',
      body: JSON.stringify({ targetAudience, channels }),
    });

    return response.data;
  }

  /**
   * Update client communication preferences
   */
  async updateClientPreferences(clientId, preferences) {
    const response = await this.request(`/clients/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    return response.data;
  }

  /**
   * Get broadcast statistics
   */
  async getBroadcastStats(broadcastId) {
    const response = await this.request(`/${broadcastId}/stats`);
    return response.data;
  }
}

// Export singleton instance
export const broadcastApi = new BroadcastApiService();
export default broadcastApi;
