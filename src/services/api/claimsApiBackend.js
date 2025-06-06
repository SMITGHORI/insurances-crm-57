
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for claims operations
 * Connects to your Node.js + Express + MongoDB backend
 */
class ClaimsBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/claims`;
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
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      
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
   * Get all claims with filtering and pagination
   */
  async getClaims(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.claimType && params.claimType !== 'all') queryParams.append('claimType', params.claimType);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    if (params.policyId) queryParams.append('policyId', params.policyId);
    if (params.minAmount) queryParams.append('minAmount', params.minAmount);
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    
    // Add sorting parameters
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
   * Get a single claim by ID
   */
  async getClaimById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new claim
   */
  async createClaim(claimData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });

    toast.success('Claim created successfully');
    return response.data;
  }

  /**
   * Update an existing claim
   */
  async updateClaim(id, claimData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(claimData),
    });

    toast.success('Claim updated successfully');
    return response.data;
  }

  /**
   * Delete a claim
   */
  async deleteClaim(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    toast.success('Claim deleted successfully');
    return response;
  }

  /**
   * Upload claim document
   */
  async uploadDocument(claimId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    const response = await this.request(`/${claimId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    toast.success('Document uploaded successfully');
    return response.data;
  }

  /**
   * Get claim documents
   */
  async getClaimDocuments(claimId) {
    const response = await this.request(`/${claimId}/documents`);
    return response.data;
  }

  /**
   * Delete claim document
   */
  async deleteDocument(claimId, documentId) {
    const response = await this.request(`/${claimId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    toast.success('Document deleted successfully');
    return response;
  }

  /**
   * Update claim status
   */
  async updateClaimStatus(claimId, statusData) {
    const response = await this.request(`/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });

    toast.success('Claim status updated successfully');
    return response.data;
  }

  /**
   * Add note to claim
   */
  async addNote(claimId, noteData) {
    const response = await this.request(`/${claimId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    toast.success('Note added successfully');
    return response.data;
  }

  /**
   * Get claim notes
   */
  async getClaimNotes(claimId) {
    const response = await this.request(`/${claimId}/notes`);
    return response.data;
  }

  /**
   * Search claims
   */
  async searchClaims(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Get claims statistics
   */
  async getClaimsStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const response = await this.request('/stats/dashboard');
    return response.data;
  }

  /**
   * Get claims aging report
   */
  async getClaimsAgingReport() {
    const response = await this.request('/reports/aging');
    return response.data;
  }

  /**
   * Get settlement analysis report
   */
  async getSettlementReport() {
    const response = await this.request('/reports/settlement');
    return response.data;
  }

  /**
   * Bulk update claims
   */
  async bulkUpdateClaims(claimIds, updateData) {
    const response = await this.request('/bulk/update', {
      method: 'POST',
      body: JSON.stringify({ claimIds, updateData }),
    });

    toast.success('Claims updated successfully');
    return response.data;
  }

  /**
   * Bulk assign claims to agents
   */
  async bulkAssignClaims(claimIds, assignedTo) {
    const response = await this.request('/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ claimIds, assignedTo }),
    });

    toast.success('Claims assigned successfully');
    return response.data;
  }

  /**
   * Export claims data
   */
  async exportClaims(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Download claim import template
   */
  async downloadTemplate() {
    const response = await this.request('/templates/download');
    return response.data;
  }

  /**
   * Import claims from file
   */
  async importClaims(file) {
    const formData = new FormData();
    formData.append('importFile', file);

    const response = await this.request('/import', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    toast.success('Claims imported successfully');
    return response.data;
  }
}

// Export singleton instance
export const claimsBackendApi = new ClaimsBackendApiService();
export default claimsBackendApi;
