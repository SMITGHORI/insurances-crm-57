
import { toast } from 'sonner';

// Base API configuration for broadcast operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * MongoDB-connected Broadcast API service for offers and messaging
 * All demo data removed - using real database operations
 */
class BroadcastApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/broadcast`;
    this.enhancedURL = `${API_BASE_URL}/enhanced-broadcast`;
  }

  /**
   * Generic API request handler with MongoDB connection
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
      console.log('Making MongoDB request to:', url);
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('MongoDB response received:', responseData);
      return responseData;
    } catch (error) {
      console.error('MongoDB Broadcast API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all broadcasts from MongoDB
   */
  async getBroadcasts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    console.log('Fetching broadcasts from MongoDB with params:', params);
    const response = await this.request(endpoint);
    
    return {
      data: response.data || [],
      total: response.pagination?.totalItems || 0,
      totalPages: response.pagination?.totalPages || 0,
      currentPage: response.pagination?.currentPage || 1,
      success: true
    };
  }

  /**
   * Create new broadcast in MongoDB
   */
  async createBroadcast(broadcastData) {
    console.log('Creating broadcast in MongoDB:', broadcastData);
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });

    return response.data;
  }

  /**
   * Update broadcast in MongoDB
   */
  async updateBroadcast(broadcastId, broadcastData) {
    console.log('Updating broadcast in MongoDB:', broadcastId, broadcastData);
    const response = await this.request(`/${broadcastId}`, {
      method: 'PUT',
      body: JSON.stringify(broadcastData),
    });

    return response.data;
  }

  /**
   * Delete broadcast from MongoDB
   */
  async deleteBroadcast(broadcastId) {
    console.log('Deleting broadcast from MongoDB:', broadcastId);
    const response = await this.request(`/${broadcastId}`, {
      method: 'DELETE',
    });

    return response.data;
  }

  /**
   * Get single broadcast from MongoDB
   */
  async getBroadcastById(broadcastId) {
    console.log('Fetching broadcast from MongoDB:', broadcastId);
    const response = await this.request(`/${broadcastId}`);
    return response.data;
  }

  /**
   * Get eligible clients for broadcast from MongoDB
   */
  async getEligibleClients(targetAudience, channels) {
    console.log('Fetching eligible clients from MongoDB:', targetAudience, channels);
    const response = await this.request('/eligible-clients', {
      method: 'POST',
      body: JSON.stringify({ targetAudience, channels }),
    });

    return response.data;
  }

  /**
   * Update client communication preferences in MongoDB
   */
  async updateClientPreferences(clientId, preferences) {
    console.log('Updating client preferences in MongoDB:', clientId, preferences);
    const response = await this.request(`/clients/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });

    return response.data;
  }

  /**
   * Get broadcast statistics from MongoDB
   */
  async getBroadcastStats(broadcastId) {
    console.log('Fetching broadcast stats from MongoDB:', broadcastId);
    const response = await this.request(`/${broadcastId}/stats`);
    return response.data;
  }

  /**
   * Get all offers from MongoDB
   */
  async getOffers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = `/offers${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching offers from MongoDB with params:', params);
    const response = await this.request(endpoint);
    
    return {
      data: response.data || [],
      total: response.pagination?.totalItems || 0,
      totalPages: response.pagination?.totalPages || 0,
      currentPage: response.pagination?.currentPage || 1,
      success: true
    };
  }

  /**
   * Create new offer in MongoDB
   */
  async createOffer(offerData) {
    console.log('Creating offer in MongoDB:', offerData);
    const response = await this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });

    return response.data;
  }

  /**
   * Update offer in MongoDB
   */
  async updateOffer(offerId, offerData) {
    console.log('Updating offer in MongoDB:', offerId, offerData);
    const response = await this.request(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });

    return response.data;
  }

  /**
   * Delete offer from MongoDB
   */
  async deleteOffer(offerId) {
    console.log('Deleting offer from MongoDB:', offerId);
    const response = await this.request(`/offers/${offerId}`, {
      method: 'DELETE',
    });

    return response.data;
  }

  /**
   * Get single offer from MongoDB
   */
  async getOfferById(offerId) {
    console.log('Fetching offer from MongoDB:', offerId);
    const response = await this.request(`/offers/${offerId}`);
    return response.data;
  }

  /**
   * Send broadcast to clients via MongoDB
   */
  async sendBroadcast(broadcastId) {
    console.log('Sending broadcast via MongoDB:', broadcastId);
    const response = await this.request(`/${broadcastId}/send`, {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Get broadcast templates from MongoDB
   */
  async getBroadcastTemplates(params = {}) {
    console.log('Fetching broadcast templates from MongoDB:', params);
    const response = await this.request(`${this.enhancedURL}/templates`, {
      method: 'GET',
    });
    return response.data;
  }

  /**
   * Create broadcast template in MongoDB
   */
  async createBroadcastTemplate(templateData) {
    console.log('Creating broadcast template in MongoDB:', templateData);
    const response = await this.request(`${this.enhancedURL}/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData),
    });

    return response.data;
  }

  /**
   * Get analytics for broadcast from MongoDB
   */
  async getBroadcastAnalytics(broadcastId) {
    console.log('Fetching broadcast analytics from MongoDB:', broadcastId);
    const response = await this.request(`${this.enhancedURL}/${broadcastId}/analytics`);
    return response.data;
  }

  /**
   * Export broadcasts data from MongoDB
   */
  async exportBroadcasts(params = {}) {
    console.log('Exporting broadcasts from MongoDB:', params);
    const response = await this.request('/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return response.data;
  }

  /**
   * Export offers data from MongoDB
   */
  async exportOffers(params = {}) {
    console.log('Exporting offers from MongoDB:', params);
    const response = await this.request('/offers/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return response.data;
  }
}

// Export singleton instance
export const broadcastApi = new BroadcastApiService();
export default broadcastApi;
