
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

/**
 * Backend API service for leads operations
 * Connects to Node.js + Express + MongoDB backend
 */
class LeadsBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LEADS}`;
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
   * Get all leads with filtering and pagination
   */
  async getLeads(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.source && params.source !== 'all') queryParams.append('source', params.source);
    if (params.priority && params.priority !== 'all') queryParams.append('priority', params.priority);
    if (params.assignedTo && params.assignedTo !== 'all') queryParams.append('assignedTo', params.assignedTo);
    
    // Add sorting parameters
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Add date range parameters
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      leads: response.data.leads,
      totalCount: response.data.totalCount,
      pagination: response.data.pagination,
      success: true
    };
  }

  /**
   * Get a single lead by ID
   */
  async getLeadById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new lead
   */
  async createLead(leadData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });

    return response.data;
  }

  /**
   * Update an existing lead
   */
  async updateLead(id, leadData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });

    return response.data;
  }

  /**
   * Delete a lead
   */
  async deleteLead(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Add follow-up to lead
   */
  async addFollowUp(leadId, followUpData) {
    const response = await this.request(`/${leadId}/followups`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });

    return response.data;
  }

  /**
   * Add note to lead
   */
  async addNote(leadId, noteData) {
    const response = await this.request(`/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    return response.data;
  }

  /**
   * Assign lead to agent
   */
  async assignLead(leadId, assignmentData) {
    const response = await this.request(`/${leadId}/assign`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });

    return response.data;
  }

  /**
   * Convert lead to client
   */
  async convertToClient(leadId) {
    const response = await this.request(`/${leadId}/convert`, {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Get leads statistics
   */
  async getLeadsStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.agentId) queryParams.append('agentId', params.agentId);

    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Search leads
   */
  async searchLeads(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }
}

// Export singleton instance
export const leadsBackendApi = new LeadsBackendApiService();
export default leadsBackendApi;
