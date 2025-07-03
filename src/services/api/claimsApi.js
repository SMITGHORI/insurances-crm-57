
import { toast } from 'sonner';
import claimsBackendApi from './claimsApiBackend';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API service for claims operations
 * Connects directly to Node.js + Express + MongoDB backend
 */
class ClaimsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/claims`;
    this.backendApi = claimsBackendApi;
  }

  /**
   * Check backend connectivity
   */
  async checkBackendAvailability() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Backend not available:', error);
      return false;
    }
  }

  /**
   * Get all claims with filtering and pagination
   */
  async getClaims(params = {}) {
    try {
      console.log('Fetching claims from MongoDB:', params);
      const result = await this.backendApi.getClaims(params);
      console.log('Claims fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claims from MongoDB:', error);
      toast.error('Failed to load claims from database');
      throw error;
    }
  }

  /**
   * Get a single claim by ID
   */
  async getClaimById(id) {
    try {
      console.log('Fetching claim from MongoDB:', id);
      const result = await this.backendApi.getClaimById(id);
      console.log('Claim fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claim from MongoDB:', error);
      toast.error('Failed to load claim details');
      throw error;
    }
  }

  /**
   * Create a new claim
   */
  async createClaim(claimData) {
    try {
      console.log('Creating claim in MongoDB:', claimData);
      const result = await this.backendApi.createClaim(claimData);
      console.log('Claim created in MongoDB:', result);
      toast.success('Claim created successfully');
      return result;
    } catch (error) {
      console.error('Failed to create claim in MongoDB:', error);
      toast.error(`Failed to create claim: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing claim
   */
  async updateClaim(id, claimData) {
    try {
      console.log('Updating claim in MongoDB:', { id, claimData });
      const result = await this.backendApi.updateClaim(id, claimData);
      console.log('Claim updated in MongoDB:', result);
      toast.success('Claim updated successfully');
      return result;
    } catch (error) {
      console.error('Failed to update claim in MongoDB:', error);
      toast.error(`Failed to update claim: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a claim
   */
  async deleteClaim(id) {
    try {
      console.log('Deleting claim from MongoDB:', id);
      const result = await this.backendApi.deleteClaim(id);
      console.log('Claim deleted from MongoDB:', result);
      toast.success('Claim deleted successfully');
      return result;
    } catch (error) {
      console.error('Failed to delete claim from MongoDB:', error);
      toast.error(`Failed to delete claim: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload claim document
   */
  async uploadDocument(claimId, documentType, file, name) {
    try {
      console.log('Uploading document to MongoDB:', { claimId, documentType, fileName: file.name });
      const result = await this.backendApi.uploadDocument(claimId, documentType, file, name);
      console.log('Document uploaded to MongoDB:', result);
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`);
      return result;
    } catch (error) {
      console.error('Failed to upload document to MongoDB:', error);
      toast.error(`Failed to upload ${documentType} document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get claim documents
   */
  async getClaimDocuments(claimId) {
    try {
      console.log('Fetching claim documents from MongoDB:', claimId);
      const result = await this.backendApi.getClaimDocuments(claimId);
      console.log('Claim documents fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claim documents from MongoDB:', error);
      toast.error('Failed to load claim documents');
      throw error;
    }
  }

  /**
   * Delete claim document
   */
  async deleteDocument(claimId, documentId) {
    try {
      console.log('Deleting document from MongoDB:', { claimId, documentId });
      const result = await this.backendApi.deleteDocument(claimId, documentId);
      console.log('Document deleted from MongoDB:', result);
      toast.success('Document deleted successfully');
      return result;
    } catch (error) {
      console.error('Failed to delete document from MongoDB:', error);
      toast.error(`Failed to delete document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update claim status
   */
  async updateClaimStatus(claimId, status, reason, approvedAmount) {
    try {
      console.log('Updating claim status in MongoDB:', { claimId, status, reason, approvedAmount });
      const result = await this.backendApi.updateClaimStatus(claimId, status, reason, approvedAmount);
      console.log('Claim status updated in MongoDB:', result);
      toast.success('Claim status updated successfully');
      return result;
    } catch (error) {
      console.error('Failed to update claim status in MongoDB:', error);
      toast.error(`Failed to update claim status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add note to claim
   */
  async addNote(claimId, noteData) {
    try {
      console.log('Adding note to MongoDB:', { claimId, noteData });
      const result = await this.backendApi.addNote(claimId, noteData);
      console.log('Note added to MongoDB:', result);
      toast.success('Note added successfully');
      return result;
    } catch (error) {
      console.error('Failed to add note to MongoDB:', error);
      toast.error(`Failed to add note: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get claim notes
   */
  async getClaimNotes(claimId) {
    try {
      console.log('Fetching claim notes from MongoDB:', claimId);
      const result = await this.backendApi.getClaimNotes(claimId);
      console.log('Claim notes fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claim notes from MongoDB:', error);
      toast.error('Failed to load claim notes');
      throw error;
    }
  }

  /**
   * Search claims
   */
  async searchClaims(query, limit = 20) {
    try {
      console.log('Searching claims in MongoDB:', { query, limit });
      const result = await this.backendApi.searchClaims(query, limit);
      console.log('Claim search results from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to search claims in MongoDB:', error);
      toast.error('Failed to search claims');
      throw error;
    }
  }

  /**
   * Get claims statistics
   */
  async getClaimsStats(params = {}) {
    try {
      console.log('Fetching claims statistics from MongoDB:', params);
      const result = await this.backendApi.getClaimsStats(params);
      console.log('Claims statistics fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claims statistics from MongoDB:', error);
      toast.error('Failed to load claims statistics');
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      console.log('Fetching claims dashboard stats from MongoDB');
      const result = await this.backendApi.getDashboardStats();
      console.log('Claims dashboard stats fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch claims dashboard stats from MongoDB:', error);
      toast.error('Failed to load dashboard statistics');
      throw error;
    }
  }

  /**
   * Bulk update claims
   */
  async bulkUpdateClaims(claimIds, updateData) {
    try {
      console.log('Bulk updating claims in MongoDB:', { claimIds, updateData });
      const result = await this.backendApi.bulkUpdateClaims(claimIds, updateData);
      console.log('Claims bulk updated in MongoDB:', result);
      toast.success(`${claimIds.length} claims updated successfully`);
      return result;
    } catch (error) {
      console.error('Failed to bulk update claims in MongoDB:', error);
      toast.error(`Failed to update claims: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk assign claims
   */
  async bulkAssignClaims(claimIds, agentId) {
    try {
      console.log('Bulk assigning claims in MongoDB:', { claimIds, agentId });
      const result = await this.backendApi.bulkAssignClaims(claimIds, agentId);
      console.log('Claims bulk assigned in MongoDB:', result);
      toast.success(`${claimIds.length} claims assigned successfully`);
      return result;
    } catch (error) {
      console.error('Failed to bulk assign claims in MongoDB:', error);
      toast.error(`Failed to assign claims: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export claims data
   */
  async exportClaims(filters = {}) {
    try {
      console.log('Exporting claims from MongoDB:', filters);
      const result = await this.backendApi.exportClaims(filters);
      console.log('Claims export completed from MongoDB:', result);
      toast.success('Claims exported successfully');
      return result;
    } catch (error) {
      console.error('Failed to export claims from MongoDB:', error);
      toast.error(`Failed to export claims: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get form data for policies
   */
  async getPoliciesForClaim() {
    try {
      console.log('Fetching policies for claim form from MongoDB');
      const result = await this.backendApi.getPoliciesForClaim();
      console.log('Policies for claim form fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policies for claim form from MongoDB:', error);
      toast.error('Failed to load policies');
      throw error;
    }
  }

  /**
   * Get form data for clients
   */
  async getClientsForClaim() {
    try {
      console.log('Fetching clients for claim form from MongoDB');
      const result = await this.backendApi.getClientsForClaim();
      console.log('Clients for claim form fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch clients for claim form from MongoDB:', error);
      toast.error('Failed to load clients');
      throw error;
    }
  }

  /**
   * Get policy details for claim
   */
  async getPolicyDetails(policyId) {
    try {
      console.log('Fetching policy details for claim from MongoDB:', policyId);
      const result = await this.backendApi.getPolicyDetails(policyId);
      console.log('Policy details for claim fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policy details for claim from MongoDB:', error);
      toast.error('Failed to load policy details');
      throw error;
    }
  }
}

// Export singleton instance
export const claimsApi = new ClaimsApiService();
export default claimsApi;
