
import { toast } from 'sonner';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API service for client operations
 * Designed for Node.js + Express + MongoDB backend
 */
class ClientsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/clients`;
  }

  /**
   * Generic API request handler with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} API response
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

    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      toast.error(error.message || 'An error occurred while processing your request');
      throw error;
    }
  }

  /**
   * Get all clients with optional filtering and pagination
   * GET /api/clients?page=1&limit=10&search=&type=&status=
   */
  async getClients(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.status && params.status !== 'All') queryParams.append('status', params.status);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.request(endpoint);
  }

  /**
   * Get a single client by ID
   * GET /api/clients/:id
   */
  async getClientById(id) {
    return this.request(`/${id}`);
  }

  /**
   * Create a new client
   * POST /api/clients
   */
  async createClient(clientData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  /**
   * Update an existing client
   * PUT /api/clients/:id
   */
  async updateClient(id, clientData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  /**
   * Delete a client
   * DELETE /api/clients/:id
   */
  async deleteClient(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Upload client document
   * POST /api/clients/:id/documents
   */
  async uploadDocument(clientId, documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    return this.request(`/${clientId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  /**
   * Get client documents
   * GET /api/clients/:id/documents
   */
  async getClientDocuments(clientId) {
    return this.request(`/${clientId}/documents`);
  }

  /**
   * Delete client document
   * DELETE /api/clients/:id/documents/:documentId
   */
  async deleteDocument(clientId, documentId) {
    return this.request(`/${clientId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const clientsApi = new ClientsApiService();
export default clientsApi;
