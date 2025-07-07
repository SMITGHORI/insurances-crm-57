
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Leads API Service with MongoDB Integration
 */
class LeadsApiBackendService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.LEADS);
  }

  async getLeads(params = {}) {
    return this.getAll(params);
  }

  async getLeadById(leadId) {
    return this.getById(leadId);
  }

  async createLead(leadData) {
    return this.create(leadData);
  }

  async updateLead(leadId, leadData) {
    return this.update(leadId, leadData);
  }

  async deleteLead(leadId) {
    return this.delete(leadId);
  }

  async getLeadsStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    return this.makeRequest(endpoint);
  }

  async getLeadFunnelReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/funnel-report?${queryString}` : '/funnel-report';
    return this.makeRequest(endpoint);
  }

  async getStaleLeads(days = 7) {
    return this.makeRequest(`/stale?days=${days}`);
  }

  async searchLeads(query, limit = 10) {
    const params = { q: query, limit };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/search?${queryString}`);
  }

  async addFollowUp(leadId, followUpData) {
    return this.makeRequest(`/${leadId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(followUpData)
    });
  }

  async addNote(leadId, noteData) {
    return this.makeRequest(`/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async assignLead(leadId, assignmentData) {
    return this.makeRequest(`/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async convertToClient(leadId) {
    return this.makeRequest(`/${leadId}/convert`, {
      method: 'POST'
    });
  }

  async bulkUpdateLeads(leadIds, updateData) {
    return this.makeRequest('/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ leadIds, updateData })
    });
  }

  async exportLeads(exportData) {
    return this.export(exportData);
  }
}

export const leadsBackendApi = new LeadsApiBackendService();
export default leadsBackendApi;
