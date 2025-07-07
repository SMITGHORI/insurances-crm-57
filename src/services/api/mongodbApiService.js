
import { API_CONFIG } from '../../config/api.js';

/**
 * Unified MongoDB API Service
 * Base class for all API services to ensure consistent MongoDB integration
 */
class MongoDBApiService {
  constructor(basePath = '') {
    this.baseURL = `${API_CONFIG.BASE_URL}${basePath}`;
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
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config = {
      headers,
      ...options
    };

    try {
      console.log(`MongoDB API Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`MongoDB API Response: ${url}`, data);
      return data;
    } catch (error) {
      console.error(`MongoDB API Request failed for ${url}:`, error);
      throw error;
    }
  }

  // Common CRUD operations
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `?${queryString}` : '';
    return this.makeRequest(endpoint);
  }

  async getById(id) {
    return this.makeRequest(`/${id}`);
  }

  async create(data) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(id, data) {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE'
    });
  }

  async search(query, limit = 10) {
    const params = { q: query, limit };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/search?${queryString}`);
  }

  async export(exportData) {
    return this.makeRequest('/export', {
      method: 'POST',
      body: JSON.stringify(exportData)
    });
  }
}

export default MongoDBApiService;
