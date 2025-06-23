
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class EnhancedBroadcastApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/enhanced-broadcast`;
    this.basicURL = `${API_BASE_URL}/broadcast`;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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
      console.error('Enhanced Broadcast API Request failed:', error.message);
      throw error;
    }
  }

  async basicRequest(endpoint, options = {}) {
    const url = `${this.basicURL}${endpoint}`;
    return this.request(url, options);
  }

  // Enhanced Broadcast Methods
  async getBroadcasts(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    return response.data;
  }

  async createBroadcast(broadcastData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });
    return response.data;
  }

  async getBroadcastAnalytics(broadcastId) {
    const response = await this.request(`/${broadcastId}/analytics`);
    return response.data;
  }

  async approveBroadcast(broadcastId, action, reason) {
    const response = await this.request(`/${broadcastId}/approval`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
    return response.data;
  }

  async manageAbTest(broadcastId, action, variantData) {
    const response = await this.request(`/${broadcastId}/ab-test`, {
      method: 'POST',
      body: JSON.stringify({ action, variantData }),
    });
    return response.data;
  }

  async getTemplates(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/templates${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  async createTemplate(templateData) {
    const response = await this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return response.data;
  }

  async triggerAutomation(triggerType) {
    const response = await this.request(`/triggers/${triggerType}`, {
      method: 'POST',
    });
    return response.data;
  }

  // Basic Broadcast Methods (for compatibility)
  async getEligibleClients(targetAudience) {
    const response = await this.basicRequest('/eligible-clients', {
      method: 'POST',
      body: JSON.stringify({ targetAudience }),
    });
    return response.data;
  }

  async updateClientPreferences(clientId, preferences) {
    const response = await this.basicRequest(`/clients/${clientId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    return response.data;
  }

  async getBroadcastStats(broadcastId) {
    const response = await this.basicRequest(`/${broadcastId}/stats`);
    return response.data;
  }
}

export const enhancedBroadcastApi = new EnhancedBroadcastApiService();
export default enhancedBroadcastApi;
