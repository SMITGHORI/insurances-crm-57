
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for policy operations
 * Connects to your Node.js + Express + MongoDB backend
 */
class PoliciesBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/policies`;
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
   * Get all policies with filtering and pagination
   */
  async getPolicies(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.status && params.status !== 'All') queryParams.append('status', params.status);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    if (params.agentId) queryParams.append('agentId', params.agentId);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    // Add premium range filters
    if (params.minPremium) queryParams.append('minPremium', params.minPremium);
    if (params.maxPremium) queryParams.append('maxPremium', params.maxPremium);

    // Add date filters
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

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
   * Get a single policy by ID
   */
  async getPolicyById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new policy
   */
  async createPolicy(policyData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });

    return response.data;
  }

  /**
   * Update an existing policy
   */
  async updatePolicy(id, policyData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });

    return response.data;
  }

  /**
   * Delete a policy
   */
  async deletePolicy(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Upload policy document
   */
  async uploadDocument(policyId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    const response = await this.request(`/${policyId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    return response.data;
  }

  /**
   * Get policy documents
   */
  async getPolicyDocuments(policyId) {
    const response = await this.request(`/${policyId}/documents`);
    return response.data;
  }

  /**
   * Delete policy document
   */
  async deleteDocument(policyId, documentId) {
    const response = await this.request(`/${policyId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Add payment record
   */
  async addPayment(policyId, paymentData) {
    const response = await this.request(`/${policyId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    return response.data;
  }

  /**
   * Get policy payment history
   */
  async getPaymentHistory(policyId) {
    const response = await this.request(`/${policyId}/payments`);
    return response.data;
  }

  /**
   * Renew policy
   */
  async renewPolicy(policyId, renewalData) {
    const response = await this.request(`/${policyId}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData),
    });

    return response.data;
  }

  /**
   * Add note to policy
   */
  async addNote(policyId, noteData) {
    const response = await this.request(`/${policyId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    return response.data;
  }

  /**
   * Get policy notes
   */
  async getPolicyNotes(policyId) {
    const response = await this.request(`/${policyId}/notes`);
    return response.data;
  }

  /**
   * Search policies
   */
  async searchPolicies(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Get policies by agent
   */
  async getPoliciesByAgent(agentId) {
    const response = await this.request(`/agent/${agentId}`);
    return response.data;
  }

  /**
   * Assign policy to agent
   */
  async assignPolicyToAgent(policyId, agentId) {
    const response = await this.request(`/${policyId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });

    return response.data;
  }

  /**
   * Get policy statistics
   */
  async getPolicyStats() {
    const response = await this.request('/stats/summary');
    return response.data;
  }

  /**
   * Get policies expiring within specified days
   */
  async getExpiringPolicies(days = 30) {
    const response = await this.request(`/expiring/${days}`);
    return response.data;
  }

  /**
   * Get policies due for renewal
   */
  async getPoliciesDueForRenewal(days = 30) {
    const response = await this.request(`/renewals/due?days=${days}`);
    return response.data;
  }

  /**
   * Bulk assign policies to agents
   */
  async bulkAssignPolicies(policyIds, agentId) {
    const response = await this.request('/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ policyIds, agentId }),
    });

    return response.data;
  }

  /**
   * Export policies data
   */
  async exportPolicies(filters = {}) {
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
   * Get endorsement history for a policy
   */
  async getEndorsementHistory(policyId) {
    const response = await this.request(`/${policyId}/endorsements`);
    return response.data;
  }

  /**
   * Add endorsement to policy
   */
  async addEndorsement(policyId, endorsementData) {
    const response = await this.request(`/${policyId}/endorsements`, {
      method: 'POST',
      body: JSON.stringify(endorsementData),
    });

    return response.data;
  }

  /**
   * Get commission details for a policy
   */
  async getCommissionDetails(policyId) {
    const response = await this.request(`/${policyId}/commission`);
    return response.data;
  }

  /**
   * Update commission details
   */
  async updateCommissionDetails(policyId, commissionData) {
    const response = await this.request(`/${policyId}/commission`, {
      method: 'PUT',
      body: JSON.stringify(commissionData),
    });

    return response.data;
  }

  /**
   * Get policy members (for group policies)
   */
  async getPolicyMembers(policyId) {
    const response = await this.request(`/${policyId}/members`);
    return response.data;
  }

  /**
   * Add member to policy (for group policies)
   */
  async addPolicyMember(policyId, memberData) {
    const response = await this.request(`/${policyId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });

    return response.data;
  }

  /**
   * Remove member from policy
   */
  async removePolicyMember(policyId, memberId) {
    const response = await this.request(`/${policyId}/members/${memberId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Cancel policy
   */
  async cancelPolicy(policyId, cancellationData) {
    const response = await this.request(`/${policyId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(cancellationData),
    });

    return response.data;
  }

  /**
   * Reinstate policy
   */
  async reinstatePolicy(policyId, reinstatementData) {
    const response = await this.request(`/${policyId}/reinstate`, {
      method: 'POST',
      body: JSON.stringify(reinstatementData),
    });

    return response.data;
  }
}

// Export singleton instance
export const policiesBackendApi = new PoliciesBackendApiService();
export default policiesBackendApi;
