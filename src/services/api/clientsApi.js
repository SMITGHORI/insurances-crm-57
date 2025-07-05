
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Clients API Service
 * Handles all client-related API operations
 */
class ClientsApiService {
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
      console.error('Clients API Request failed:', error);
      throw error;
    }
  }

  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.CLIENTS}?${queryString}` : API_ENDPOINTS.CLIENTS;
    return this.makeRequest(endpoint);
  }

  async getClientById(clientId) {
    return this.makeRequest(API_ENDPOINTS.CLIENT_BY_ID(clientId));
  }

  async createClient(clientData) {
    return this.makeRequest(API_ENDPOINTS.CLIENTS, {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  }

  async updateClient(clientId, clientData) {
    return this.makeRequest(API_ENDPOINTS.CLIENT_BY_ID(clientId), {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });
  }

  async deleteClient(clientId) {
    return this.makeRequest(API_ENDPOINTS.CLIENT_BY_ID(clientId), {
      method: 'DELETE'
    });
  }

  async searchClients(query, filters = {}) {
    const params = { search: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`${API_ENDPOINTS.CLIENTS}/search?${queryString}`);
  }

  async bulkUpdateClients(clientIds, updateData) {
    return this.makeRequest(`${API_ENDPOINTS.CLIENTS}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ clientIds, updateData })
    });
  }

  async exportClients(exportData) {
    return this.makeRequest(`${API_ENDPOINTS.CLIENTS}/export`, {
      method: 'POST',
      body: JSON.stringify(exportData)
    });
  }
}

export const clientsApi = new ClientsApiService();
