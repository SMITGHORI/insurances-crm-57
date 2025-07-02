
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for client operations
 * Connects to your Node.js + Express + MongoDB backend
 */
class ClientsBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/clients`;
  }

  /**
   * Generic API request handler with error handling
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
      console.log(`Making API request to: ${url}`, config);
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      console.log('API response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all clients with filtering and pagination
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

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination?.totalItems || response.total || 0,
      totalPages: response.pagination?.totalPages || response.totalPages || 1,
      currentPage: response.pagination?.currentPage || response.currentPage || 1,
      success: true
    };
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new client
   */
  async createClient(clientData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });

    return response.data;
  }

  /**
   * Update an existing client
   */
  async updateClient(id, clientData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });

    return response.data;
  }

  /**
   * Delete a client
   */
  async deleteClient(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Upload client document
   */
  async uploadDocument(clientId, documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await this.request(`/${clientId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    return response.data;
  }

  /**
   * Get client documents
   */
  async getClientDocuments(clientId) {
    const response = await this.request(`/${clientId}/documents`);
    return response.data;
  }

  /**
   * Delete client document
   */
  async deleteDocument(clientId, documentId) {
    const response = await this.request(`/${clientId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Search clients
   */
  async searchClients(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Get clients by agent
   */
  async getClientsByAgent(agentId) {
    const response = await this.request(`/agent/${agentId}`);
    return response.data;
  }

  /**
   * Assign client to agent
   */
  async assignClientToAgent(clientId, agentId) {
    const response = await this.request(`/${clientId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });

    return response.data;
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    const response = await this.request('/stats/summary');
    return response.data;
  }

  /**
   * Export clients data
   */
  async exportClients(exportData) {
    const response = await this.request('/export', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });

    // Handle file download
    if (response.data && response.data.downloadUrl) {
      // If backend returns a download URL
      window.open(response.data.downloadUrl, '_blank');
    } else if (response.data && response.data.fileContent) {
      // If backend returns file content directly
      const blob = new Blob([response.data.fileContent], { 
        type: exportData.format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export.${exportData.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    return response;
  }
}

// Export both class and singleton instance
export { ClientsBackendApiService };
export const clientsBackendApi = new ClientsBackendApiService();
export default clientsBackendApi;
