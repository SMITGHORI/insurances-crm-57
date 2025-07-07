
import { API_CONFIG } from '../../config/api';

class PoliciesBackendApi {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/policies`;
  }

  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const isDemoMode = localStorage.getItem('demoMode');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && !isDemoMode ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const config = { ...defaultOptions, ...options };
    
    try {
      // In demo mode, return mock data
      if (isDemoMode) {
        return this.getMockData(endpoint, config.method);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Fallback to mock data on network errors
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        console.log('Network error, using fallback mock data');
        return this.getMockData(endpoint, config.method);
      }
      
      throw error;
    }
  }

  getMockData(endpoint, method = 'GET') {
    const mockPolicies = [
      {
        _id: 'pol1',
        policyNumber: 'POL-2024-001',
        clientId: { displayName: 'John Doe', email: 'john@example.com' },
        type: 'life',
        status: 'Active',
        premium: 25000,
        sumAssured: 1000000,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        insuranceCompany: 'LIC India',
        assignedAgentId: 'agent-fallback-id'
      },
      {
        _id: 'pol2',
        policyNumber: 'POL-2024-002',
        clientId: { displayName: 'Jane Smith', email: 'jane@example.com' },
        type: 'health',
        status: 'Active',
        premium: 15000,
        sumAssured: 500000,
        startDate: '2024-02-01',
        endDate: '2025-02-01',
        insuranceCompany: 'Star Health',
        assignedAgentId: 'agent-fallback-id'
      }
    ];

    if (endpoint.includes('/stats')) {
      return {
        success: true,
        data: {
          totalPolicies: mockPolicies.length,
          activePolicies: mockPolicies.filter(p => p.status === 'Active').length,
          totalPremium: mockPolicies.reduce((sum, p) => sum + p.premium, 0),
          expiringPolicies: 0
        }
      };
    }

    if (method === 'POST') {
      return {
        success: true,
        data: { _id: 'new-policy-id', ...mockPolicies[0] }
      };
    }

    return {
      success: true,
      data: mockPolicies,
      total: mockPolicies.length,
      totalPages: 1,
      currentPage: 1
    };
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
