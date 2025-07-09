
import { API_CONFIG } from '../../config/api.js';

/**
 * Base MongoDB API Service Class
 * Provides common CRUD operations for all MongoDB collections
 */
class MongoDBApiService {
  constructor(endpoint) {
    this.baseURL = API_CONFIG.BASE_URL;
    this.endpoint = endpoint;
  }

  /**
   * Make HTTP request with proper error handling
   */
  async makeRequest(url, options = {}) {
    const requestUrl = url.startsWith('http') ? url : `${this.baseURL}${this.endpoint}${url}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`Making ${requestOptions.method || 'GET'} request to:`, requestUrl);
      
      const response = await fetch(requestUrl, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Get all records with pagination and filtering
   */
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `?${queryString}` : '';
    return this.makeRequest(url);
  }

  /**
   * Get single record by ID
   */
  async getById(id) {
    return this.makeRequest(`/${id}`);
  }

  /**
   * Create new record
   */
  async create(data) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Update existing record
   */
  async update(id, data) {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete record
   */
  async delete(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Export data
   */
  async export(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/export${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(url);
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(data) {
    return this.makeRequest('/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Search functionality
   */
  async search(query, params = {}) {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return this.makeRequest(`/search?${searchParams}`);
  }
}

export default MongoDBApiService;
