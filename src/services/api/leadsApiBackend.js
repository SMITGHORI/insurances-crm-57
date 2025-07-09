
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Leads API Service with MongoDB Integration
 * Provides comprehensive CRUD operations for leads management
 */
class LeadsApiBackendService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.LEADS);
  }

  /**
   * Get all leads with advanced filtering and pagination
   */
  async getLeads(params = {}) {
    try {
      console.log('Fetching leads from MongoDB with params:', params);
      const response = await this.getAll(params);
      
      // Ensure consistent response format
      if (response.success && response.data) {
        return {
          leads: response.data.leads || response.data,
          pagination: response.data.pagination || {},
          totalCount: response.data.totalCount || 0
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }
  }

  /**
   * Get single lead by ID with full details
   */
  async getLeadById(leadId) {
    try {
      console.log('Fetching lead by ID:', leadId);
      const response = await this.getById(leadId);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error(`Failed to fetch lead: ${error.message}`);
    }
  }

  /**
   * Create new lead with validation
   */
  async createLead(leadData) {
    try {
      console.log('Creating lead in MongoDB:', leadData);
      
      // Ensure required fields are present
      if (!leadData.name || !leadData.email || !leadData.phone) {
        throw new Error('Missing required fields: name, email, or phone');
      }

      const response = await this.create(leadData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }
  }

  /**
   * Update existing lead
   */
  async updateLead(leadId, leadData) {
    try {
      console.log('Updating lead in MongoDB:', leadId, leadData);
      const response = await this.update(leadId, leadData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }
  }

  /**
   * Delete lead
   */
  async deleteLead(leadId) {
    try {
      console.log('Deleting lead from MongoDB:', leadId);
      const response = await this.delete(leadId);
      return response;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  /**
   * Get leads statistics
   */
  async getLeadsStats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/stats?${queryString}` : '/stats';
      const response = await this.makeRequest(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching leads stats:', error);
      throw new Error(`Failed to fetch leads statistics: ${error.message}`);
    }
  }

  /**
   * Get lead funnel report
   */
  async getLeadFunnelReport(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/funnel-report?${queryString}` : '/funnel-report';
      const response = await this.makeRequest(endpoint);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching funnel report:', error);
      throw new Error(`Failed to fetch lead funnel report: ${error.message}`);
    }
  }

  /**
   * Get stale leads
   */
  async getStaleLeads(days = 7) {
    try {
      const response = await this.makeRequest(`/stale?days=${days}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching stale leads:', error);
      throw new Error(`Failed to fetch stale leads: ${error.message}`);
    }
  }

  /**
   * Search leads with advanced query
   */
  async searchLeads(query, limit = 10) {
    try {
      if (!query || query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const params = { q: query, limit };
      const queryString = new URLSearchParams(params).toString();
      const response = await this.makeRequest(`/search?${queryString}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error searching leads:', error);
      throw new Error(`Failed to search leads: ${error.message}`);
    }
  }

  /**
   * Add follow-up to lead
   */
  async addFollowUp(leadId, followUpData) {
    try {
      console.log('Adding follow-up to lead:', leadId, followUpData);
      
      // Add current user as createdBy if not provided
      if (!followUpData.createdBy) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        followUpData.createdBy = user.name || 'Current User';
      }

      const response = await this.makeRequest(`/${leadId}/followups`, {
        method: 'POST',
        body: JSON.stringify(followUpData)
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw new Error(`Failed to add follow-up: ${error.message}`);
    }
  }

  /**
   * Add note to lead
   */
  async addNote(leadId, noteData) {
    try {
      console.log('Adding note to lead:', leadId, noteData);
      
      // Add current user as createdBy if not provided
      if (!noteData.createdBy) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        noteData.createdBy = user.name || 'Current User';
      }

      const response = await this.makeRequest(`/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteData)
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error(`Failed to add note: ${error.message}`);
    }
  }

  /**
   * Assign lead to agent
   */
  async assignLead(leadId, assignmentData) {
    try {
      console.log('Assigning lead:', leadId, assignmentData);
      const response = await this.makeRequest(`/${leadId}/assign`, {
        method: 'PUT',
        body: JSON.stringify(assignmentData)
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw new Error(`Failed to assign lead: ${error.message}`);
    }
  }

  /**
   * Convert lead to client
   */
  async convertToClient(leadId) {
    try {
      console.log('Converting lead to client:', leadId);
      const response = await this.makeRequest(`/${leadId}/convert`, {
        method: 'POST'
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw new Error(`Failed to convert lead to client: ${error.message}`);
    }
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(leadIds, updateData) {
    try {
      console.log('Bulk updating leads:', leadIds, updateData);
      const response = await this.makeRequest('/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ leadIds, updateData })
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      throw new Error(`Failed to bulk update leads: ${error.message}`);
    }
  }

  /**
   * Export leads data
   */
  async exportLeads(exportData) {
    try {
      console.log('Exporting leads:', exportData);
      const response = await this.export(exportData);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error exporting leads:', error);
      throw new Error(`Failed to export leads: ${error.message}`);
    }
  }
}

// Export singleton instance
export const leadsBackendApi = new LeadsApiBackendService();
export default leadsBackendApi;
