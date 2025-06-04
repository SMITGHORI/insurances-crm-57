
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for agent operations
 * Connects to your Node.js + Express + MongoDB backend
 */
class AgentsBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/agents`;
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
   * Get all agents with filtering and pagination
   */
  async getAgents(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'All') queryParams.append('status', params.status);
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.region) queryParams.append('region', params.region);
    if (params.teamId) queryParams.append('teamId', params.teamId);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    // Add date and commission filters
    if (params.hireDate) queryParams.append('hireDate', params.hireDate);
    if (params.minCommission) queryParams.append('minCommission', params.minCommission);
    if (params.maxCommission) queryParams.append('maxCommission', params.maxCommission);

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
   * Get a single agent by ID
   */
  async getAgentById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new agent
   */
  async createAgent(agentData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });

    toast.success('Agent created successfully');
    return response.data;
  }

  /**
   * Update an existing agent
   */
  async updateAgent(id, agentData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });

    toast.success('Agent updated successfully');
    return response.data;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    toast.success('Agent deleted successfully');
    return response;
  }

  /**
   * Upload agent document
   */
  async uploadDocument(agentId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    const response = await this.request(`/${agentId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    toast.success('Document uploaded successfully');
    return response.data;
  }

  /**
   * Get agent documents
   */
  async getAgentDocuments(agentId) {
    const response = await this.request(`/${agentId}/documents`);
    return response.data;
  }

  /**
   * Delete agent document
   */
  async deleteDocument(agentId, documentId) {
    const response = await this.request(`/${agentId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    toast.success('Document deleted successfully');
    return response;
  }

  /**
   * Get agent's clients
   */
  async getAgentClients(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/clients${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Get agent's policies
   */
  async getAgentPolicies(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/policies${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Get agent's commissions
   */
  async getAgentCommissions(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/commissions${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Get agent's performance data
   */
  async getAgentPerformance(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.year) queryParams.append('year', params.year);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/performance${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Update agent performance targets
   */
  async updatePerformanceTargets(agentId, targetsData) {
    const response = await this.request(`/${agentId}/targets`, {
      method: 'PUT',
      body: JSON.stringify(targetsData),
    });

    toast.success('Performance targets updated successfully');
    return response.data;
  }

  /**
   * Add note to agent
   */
  async addNote(agentId, noteData) {
    const response = await this.request(`/${agentId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    toast.success('Note added successfully');
    return response.data;
  }

  /**
   * Get agent notes
   */
  async getAgentNotes(agentId) {
    const response = await this.request(`/${agentId}/notes`);
    return response.data;
  }

  /**
   * Search agents
   */
  async searchAgents(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Get agent statistics
   */
  async getAgentStats() {
    const response = await this.request('/stats/summary');
    return response.data;
  }

  /**
   * Get agent performance rankings
   */
  async getPerformanceRankings(period = 'month', metric = 'totalPremium') {
    const response = await this.request(`/performance/rankings?period=${period}&metric=${metric}`);
    return response.data;
  }

  /**
   * Get agents with expiring licenses
   */
  async getExpiringLicenses(days = 30) {
    const response = await this.request(`/licenses/expiring?days=${days}`);
    return response.data;
  }

  /**
   * Bulk update agents
   */
  async bulkUpdateAgents(agentIds, updateData) {
    const response = await this.request('/bulk/update', {
      method: 'POST',
      body: JSON.stringify({ agentIds, updateData }),
    });

    toast.success('Agents updated successfully');
    return response.data;
  }

  /**
   * Export agents data
   */
  async exportAgents(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const agentsBackendApi = new AgentsBackendApiService();
export default agentsBackendApi;
