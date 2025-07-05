
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Leads API Service (Backend)
 * Handles all lead-related API operations with MongoDB backend
 */
class LeadsApiBackendService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && token !== 'demo-token-admin' && token !== 'demo-token-agent' && {
        'Authorization': `Bearer ${token}`
      })
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config = {
      headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Leads API Request failed:', error);
      throw error;
    }
  }

  async getLeads(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.LEADS}?${queryString}` : API_ENDPOINTS.LEADS;
    return this.makeRequest(endpoint);
  }

  async getLeadById(leadId) {
    return this.makeRequest(API_ENDPOINTS.LEAD_BY_ID(leadId));
  }

  async createLead(leadData) {
    return this.makeRequest(API_ENDPOINTS.LEADS, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  async updateLead(leadId, leadData) {
    return this.makeRequest(API_ENDPOINTS.LEAD_BY_ID(leadId), {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  }

  async deleteLead(leadId) {
    return this.makeRequest(API_ENDPOINTS.LEAD_BY_ID(leadId), {
      method: 'DELETE'
    });
  }

  async getLeadsStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.LEADS}/stats?${queryString}` : `${API_ENDPOINTS.LEADS}/stats`;
    return this.makeRequest(endpoint);
  }

  async getLeadFunnelReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.LEADS}/funnel-report?${queryString}` : `${API_ENDPOINTS.LEADS}/funnel-report`;
    return this.makeRequest(endpoint);
  }

  async getStaleLeads(days = 7) {
    return this.makeRequest(`${API_ENDPOINTS.LEADS}/stale?days=${days}`);
  }

  async searchLeads(query, limit = 10) {
    const params = { q: query, limit };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`${API_ENDPOINTS.LEADS}/search?${queryString}`);
  }

  async addFollowUp(leadId, followUpData) {
    return this.makeRequest(`${API_ENDPOINTS.LEAD_BY_ID(leadId)}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(followUpData)
    });
  }

  async addNote(leadId, noteData) {
    return this.makeRequest(`${API_ENDPOINTS.LEAD_BY_ID(leadId)}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async assignLead(leadId, assignmentData) {
    return this.makeRequest(`${API_ENDPOINTS.LEAD_BY_ID(leadId)}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async convertToClient(leadId) {
    return this.makeRequest(`${API_ENDPOINTS.LEAD_BY_ID(leadId)}/convert`, {
      method: 'POST'
    });
  }

  async bulkUpdateLeads(leadIds, updateData) {
    return this.makeRequest(`${API_ENDPOINTS.LEADS}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ leadIds, updateData })
    });
  }

  async exportLeads(exportData) {
    return this.makeRequest(`${API_ENDPOINTS.LEADS}/export`, {
      method: 'POST',
      body: JSON.stringify(exportData)
    });
  }
}

export const leadsBackendApi = new LeadsApiBackendService();
