
import { API_CONFIG } from '../../config/api';

class PoliciesBackendApi {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/policies`;
  }

  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const config = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }



  async getPolicies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `?${queryString}` : '';
    return this.makeRequest(endpoint);
  }

  async getPolicyById(id) {
    return this.makeRequest(`/${id}`);
  }

  async createPolicy(policyData) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async updatePolicy(id, policyData) {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData)
    });
  }

  async deletePolicy(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE'
    });
  }

  async getPolicyStats() {
    return this.makeRequest('/stats/summary');
  }

  async searchPolicies(query, limit = 10) {
    return this.makeRequest(`/search/${encodeURIComponent(query)}?limit=${limit}`);
  }

  async getPoliciesByAgent(agentId) {
    return this.makeRequest(`/agent/${agentId}`);
  }

  async assignPolicyToAgent(policyId, agentId) {
    return this.makeRequest(`/${policyId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId })
    });
  }

  async bulkAssignPolicies(policyIds, agentId) {
    return this.makeRequest('/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ policyIds, agentId })
    });
  }

  async exportPolicies(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getExpiringPolicies(days = 30) {
    return this.makeRequest(`/expiring/${days}`);
  }

  async getPoliciesDueForRenewal(days = 30) {
    return this.makeRequest(`/renewals/due?days=${days}`);
  }

  async uploadDocument(policyId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('name', name);

    return this.makeRequest(`/${policyId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  }

  async getPolicyDocuments(policyId) {
    return this.makeRequest(`/${policyId}/documents`);
  }

  async deleteDocument(policyId, documentId) {
    return this.makeRequest(`/${policyId}/documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  async addPayment(policyId, paymentData) {
    return this.makeRequest(`/${policyId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getPaymentHistory(policyId) {
    return this.makeRequest(`/${policyId}/payments`);
  }

  async renewPolicy(policyId, renewalData) {
    return this.makeRequest(`/${policyId}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData)
    });
  }

  async addNote(policyId, noteData) {
    return this.makeRequest(`/${policyId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async getPolicyNotes(policyId) {
    return this.makeRequest(`/${policyId}/notes`);
  }
}

export const policiesBackendApi = new PoliciesBackendApi();
export default policiesBackendApi;
