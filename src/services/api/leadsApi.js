import { toast } from 'sonner';
import { leadsBackendApi } from './leadsApiBackend';

/**
 * Frontend API service for leads operations
 * Connects directly to Node.js + Express + MongoDB backend
 * All demo data removed - using real database operations
 */
class LeadsApiService {
  constructor() {
    this.backendApi = leadsBackendApi;
  }

  /**
   * Get all leads with filtering and pagination
   */
  async getLeads(params = {}) {
    console.log('Fetching leads from MongoDB with params:', params);
    return this.backendApi.getLeads(params);
  }

  /**
   * Get a single lead by ID
   */
  async getLeadById(id) {
    console.log('Fetching lead from MongoDB:', id);
    return this.backendApi.getLeadById(id);
  }

  /**
   * Create a new lead
   */
  async createLead(leadData) {
    console.log('Creating lead in MongoDB:', leadData);
    return this.backendApi.createLead(leadData);
  }

  /**
   * Update an existing lead
   */
  async updateLead(id, leadData) {
    console.log('Updating lead in MongoDB:', id, leadData);
    return this.backendApi.updateLead(id, leadData);
  }

  /**
   * Delete a lead
   */
  async deleteLead(id) {
    console.log('Deleting lead from MongoDB:', id);
    return this.backendApi.deleteLead(id);
  }

  /**
   * Add follow-up to lead
   */
  async addFollowUp(leadId, followUpData) {
    console.log('Adding follow-up to lead in MongoDB:', leadId, followUpData);
    return this.backendApi.addFollowUp(leadId, followUpData);
  }

  /**
   * Add note to lead
   */
  async addNote(leadId, noteData) {
    console.log('Adding note to lead in MongoDB:', leadId, noteData);
    return this.backendApi.addNote(leadId, noteData);
  }

  /**
   * Assign lead to agent
   */
  async assignLead(leadId, assignmentData) {
    console.log('Assigning lead in MongoDB:', leadId, assignmentData);
    return this.backendApi.assignLead(leadId, assignmentData);
  }

  /**
   * Convert lead to client
   */
  async convertToClient(leadId) {
    console.log('Converting lead to client in MongoDB:', leadId);
    return this.backendApi.convertToClient(leadId);
  }

  /**
   * Get leads statistics
   */
  async getLeadsStats(params = {}) {
    console.log('Fetching leads stats from MongoDB:', params);
    return this.backendApi.getLeadsStats(params);
  }

  /**
   * Search leads
   */
  async searchLeads(query, limit = 10) {
    console.log('Searching leads in MongoDB:', query, limit);
    return this.backendApi.searchLeads(query, limit);
  }

  /**
   * Get lead funnel report
   */
  async getLeadFunnelReport(params = {}) {
    console.log('Fetching lead funnel report from MongoDB:', params);
    return this.backendApi.getLeadFunnelReport(params);
  }

  /**
   * Get stale leads
   */
  async getStaleLeads(days = 7) {
    console.log('Fetching stale leads from MongoDB:', days);
    return this.backendApi.getStaleLeads(days);
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(leadIds, updateData) {
    console.log('Bulk updating leads in MongoDB:', leadIds, updateData);
    return this.backendApi.bulkUpdateLeads(leadIds, updateData);
  }

  /**
   * Export leads
   */
  async exportLeads(exportData) {
    console.log('Exporting leads from MongoDB:', exportData);
    return this.backendApi.exportLeads(exportData);
  }
}

// Export singleton instance
const leadsApi = new LeadsApiService();
export default leadsApi;
