
import { toast } from 'sonner';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for claims operations
 * Connects directly to Node.js + Express + MongoDB backend
 */
class ClaimsBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/claims`;
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
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
    
    // Add search parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.claimType && params.claimType !== 'all') queryParams.append('claimType', params.claimType);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    if (params.policyId) queryParams.append('policyId', params.policyId);
    
    // Add amount filters
    if (params.minAmount) queryParams.append('minAmount', params.minAmount);
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount);
    
    // Add date filters
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    
    // Add sorting
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request(endpoint);
  }

  /**
   * Get a single claim by ID
   */
  async getClaimById(claimId) {
    return this.request(`/${claimId}`);
  }

  /**
   * Create a new claim
   */
  async createClaim(claimData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  }

  /**
   * Update an existing claim
   */
  async updateClaim(claimId, claimData) {
    return this.request(`/${claimId}`, {
      method: 'PUT',
      body: JSON.stringify(claimData),
    });
  }

  /**
   * Delete a claim
   */
  async deleteClaim(claimId) {
    return this.request(`/${claimId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Upload claim document
   */
  async uploadDocument(claimId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    return this.request(`/${claimId}/documents`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  /**
   * Get claim documents
   */
  async getClaimDocuments(claimId) {
    return this.request(`/${claimId}/documents`);
  }

  /**
   * Delete claim document
   */
  async deleteDocument(claimId, documentId) {
    return this.request(`/${claimId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update claim status
   */
  async updateClaimStatus(claimId, status, reason, approvedAmount) {
    const statusData = { status };
    if (reason) statusData.reason = reason;
    if (approvedAmount !== undefined) statusData.approvedAmount = approvedAmount;

    return this.request(`/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  /**
   * Add note to claim
   */
  async addNote(claimId, noteData) {
    return this.request(`/${claimId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Get claim notes
   */
  async getClaimNotes(claimId) {
    return this.request(`/${claimId}/notes`);
  }

  /**
   * Search claims
   */
  async searchClaims(query, limit = 20) {
    const queryParams = new URLSearchParams({
      limit: limit.toString()
    });

    return this.request(`/search/${encodeURIComponent(query)}?${queryParams.toString()}`);
  }

  /**
   * Get claims statistics
   */
  async getClaimsStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/stats/summary${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  /**
   * Bulk update claims
   */
  async bulkUpdateClaims(claimIds, updateData) {
    return this.request('/bulk/update', {
      method: 'POST',
      body: JSON.stringify({ claimIds, updateData }),
    });
  }

  /**
   * Bulk assign claims
   */
  async bulkAssignClaims(claimIds, agentId) {
    return this.request('/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ claimIds, agentId }),
    });
  }

  /**
   * Export claims data
   */
  async exportClaims(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  /**
   * Get aging report
   */
  async getClaimsAgingReport() {
    return this.request('/reports/aging');
  }

  /**
   * Get settlement report
   */
  async getSettlementReport() {
    return this.request('/reports/settlement');
  }

  /**
   * Import claims
   */
  async importClaims(file) {
    const formData = new FormData();
    formData.append('importFile', file);

    return this.request('/import', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  /**
   * Download import template
   */
  async downloadTemplate() {
    return this.request('/templates/download');
  }

  /**
   * Get form data for policies
   */
  async getPoliciesForClaim() {
    return this.request('/form-data/policies');
  }

  /**
   * Get form data for clients
   */
  async getClientsForClaim() {
    return this.request('/form-data/clients');
  }

  /**
   * Get policy details for claim
   */
  async getPolicyDetails(policyId) {
    return this.request(`/form-data/policy/${policyId}`);
  }

  /**
   * Get claim timeline
   */
  async getClaimTimeline(claimId) {
    return this.request(`/${claimId}/timeline`);
  }

  /**
   * Get claim financials
   */
  async getClaimFinancials(claimId) {
    return this.request(`/${claimId}/financials`);
  }

  /**
   * Process claim payment
   */
  async processPayment(claimId, paymentData) {
    return this.request(`/${claimId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

// Export singleton instance
const claimsBackendApi = new ClaimsBackendApiService();
export default claimsBackendApi;
