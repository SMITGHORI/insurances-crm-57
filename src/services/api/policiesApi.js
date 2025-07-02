
import { toast } from 'sonner';
import { PoliciesBackendApiService } from './policiesApiBackend';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API service for policy operations
 * Connects directly to Node.js + Express + MongoDB backend
 */
class PoliciesApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/policies`;
    this.backendApi = new PoliciesBackendApiService();
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
   * Get all policies with filtering and pagination
   */
  async getPolicies(params = {}) {
    try {
      console.log('Fetching policies from MongoDB:', params);
      const result = await this.backendApi.getPolicies(params);
      console.log('Policies fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policies from MongoDB:', error);
      toast.error('Failed to load policies from database');
      throw error;
    }
  }

  /**
   * Get a single policy by ID
   */
  async getPolicyById(id) {
    try {
      console.log('Fetching policy from MongoDB:', id);
      const result = await this.backendApi.getPolicyById(id);
      console.log('Policy fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policy from MongoDB:', error);
      toast.error('Failed to load policy details');
      throw error;
    }
  }

  /**
   * Create a new policy
   */
  async createPolicy(policyData) {
    try {
      console.log('Creating policy in MongoDB:', policyData);
      const result = await this.backendApi.createPolicy(policyData);
      console.log('Policy created in MongoDB:', result);
      toast.success('Policy created successfully');
      return result;
    } catch (error) {
      console.error('Failed to create policy in MongoDB:', error);
      toast.error(`Failed to create policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing policy
   */
  async updatePolicy(id, policyData) {
    try {
      console.log('Updating policy in MongoDB:', { id, policyData });
      const result = await this.backendApi.updatePolicy(id, policyData);
      console.log('Policy updated in MongoDB:', result);
      toast.success('Policy updated successfully');
      return result;
    } catch (error) {
      console.error('Failed to update policy in MongoDB:', error);
      toast.error(`Failed to update policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a policy
   */
  async deletePolicy(id) {
    try {
      console.log('Deleting policy from MongoDB:', id);
      const result = await this.backendApi.deletePolicy(id);
      console.log('Policy deleted from MongoDB:', result);
      toast.success('Policy deleted successfully');
      return result;
    } catch (error) {
      console.error('Failed to delete policy from MongoDB:', error);
      toast.error(`Failed to delete policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload policy document
   */
  async uploadDocument(policyId, documentType, file, name) {
    try {
      console.log('Uploading document to MongoDB:', { policyId, documentType, fileName: file.name });
      const result = await this.backendApi.uploadDocument(policyId, documentType, file, name);
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
   * Get policy documents
   */
  async getPolicyDocuments(policyId) {
    try {
      console.log('Fetching policy documents from MongoDB:', policyId);
      const result = await this.backendApi.getPolicyDocuments(policyId);
      console.log('Policy documents fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policy documents from MongoDB:', error);
      toast.error('Failed to load policy documents');
      throw error;
    }
  }

  /**
   * Delete policy document
   */
  async deleteDocument(policyId, documentId) {
    try {
      console.log('Deleting document from MongoDB:', { policyId, documentId });
      const result = await this.backendApi.deleteDocument(policyId, documentId);
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
   * Add payment record
   */
  async addPayment(policyId, paymentData) {
    try {
      console.log('Adding payment to MongoDB:', { policyId, paymentData });
      const result = await this.backendApi.addPayment(policyId, paymentData);
      console.log('Payment added to MongoDB:', result);
      toast.success('Payment record added successfully');
      return result;
    } catch (error) {
      console.error('Failed to add payment to MongoDB:', error);
      toast.error(`Failed to add payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get policy payment history
   */
  async getPaymentHistory(policyId) {
    try {
      console.log('Fetching payment history from MongoDB:', policyId);
      const result = await this.backendApi.getPaymentHistory(policyId);
      console.log('Payment history fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch payment history from MongoDB:', error);
      toast.error('Failed to load payment history');
      throw error;
    }
  }

  /**
   * Renew policy
   */
  async renewPolicy(policyId, renewalData) {
    try {
      console.log('Renewing policy in MongoDB:', { policyId, renewalData });
      const result = await this.backendApi.renewPolicy(policyId, renewalData);
      console.log('Policy renewed in MongoDB:', result);
      toast.success('Policy renewed successfully');
      return result;
    } catch (error) {
      console.error('Failed to renew policy in MongoDB:', error);
      toast.error(`Failed to renew policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add note to policy
   */
  async addNote(policyId, noteData) {
    try {
      console.log('Adding note to MongoDB:', { policyId, noteData });
      const result = await this.backendApi.addNote(policyId, noteData);
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
   * Get policy notes
   */
  async getPolicyNotes(policyId) {
    try {
      console.log('Fetching policy notes from MongoDB:', policyId);
      const result = await this.backendApi.getPolicyNotes(policyId);
      console.log('Policy notes fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policy notes from MongoDB:', error);
      toast.error('Failed to load policy notes');
      throw error;
    }
  }

  /**
   * Search policies
   */
  async searchPolicies(query, limit = 10) {
    try {
      console.log('Searching policies in MongoDB:', { query, limit });
      const result = await this.backendApi.searchPolicies(query, limit);
      console.log('Policy search results from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to search policies in MongoDB:', error);
      toast.error('Failed to search policies');
      throw error;
    }
  }

  /**
   * Get policies by agent
   */
  async getPoliciesByAgent(agentId) {
    try {
      console.log('Fetching policies by agent from MongoDB:', agentId);
      const result = await this.backendApi.getPoliciesByAgent(agentId);
      console.log('Agent policies fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch agent policies from MongoDB:', error);
      toast.error('Failed to load agent policies');
      throw error;
    }
  }

  /**
   * Assign policy to agent
   */
  async assignPolicyToAgent(policyId, agentId) {
    try {
      console.log('Assigning policy to agent in MongoDB:', { policyId, agentId });
      const result = await this.backendApi.assignPolicyToAgent(policyId, agentId);
      console.log('Policy assigned to agent in MongoDB:', result);
      toast.success('Policy assigned successfully');
      return result;
    } catch (error) {
      console.error('Failed to assign policy to agent in MongoDB:', error);
      toast.error(`Failed to assign policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get policy statistics
   */
  async getPolicyStats() {
    try {
      console.log('Fetching policy statistics from MongoDB');
      const result = await this.backendApi.getPolicyStats();
      console.log('Policy statistics fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policy statistics from MongoDB:', error);
      toast.error('Failed to load policy statistics');
      throw error;
    }
  }

  /**
   * Get policies expiring within specified days
   */
  async getExpiringPolicies(days = 30) {
    try {
      console.log('Fetching expiring policies from MongoDB:', days);
      const result = await this.backendApi.getExpiringPolicies(days);
      console.log('Expiring policies fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch expiring policies from MongoDB:', error);
      toast.error('Failed to load expiring policies');
      throw error;
    }
  }

  /**
   * Get policies due for renewal
   */
  async getPoliciesDueForRenewal(days = 30) {
    try {
      console.log('Fetching policies due for renewal from MongoDB:', days);
      const result = await this.backendApi.getPoliciesDueForRenewal(days);
      console.log('Policies due for renewal fetched from MongoDB:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch policies due for renewal from MongoDB:', error);
      toast.error('Failed to load policies due for renewal');
      throw error;
    }
  }

  /**
   * Bulk assign policies to agents
   */
  async bulkAssignPolicies(policyIds, agentId) {
    try {
      console.log('Bulk assigning policies in MongoDB:', { policyIds, agentId });
      const result = await this.backendApi.bulkAssignPolicies(policyIds, agentId);
      console.log('Bulk assign completed in MongoDB:', result);
      toast.success('Policies assigned successfully');
      return result;
    } catch (error) {
      console.error('Failed to bulk assign policies in MongoDB:', error);
      toast.error(`Failed to assign policies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export policies data
   */
  async exportPolicies(filters = {}) {
    try {
      console.log('Exporting policies from MongoDB:', filters);
      const result = await this.backendApi.exportPolicies(filters);
      console.log('Policy export completed from MongoDB:', result);
      toast.success('Policies exported successfully');
      return result;
    } catch (error) {
      console.error('Failed to export policies from MongoDB:', error);
      toast.error(`Failed to export policies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdatePolicies(policyIds, updateData) {
    try {
      console.log('Bulk updating policies in MongoDB:', { policyIds, updateData });
      const promises = policyIds.map(id => this.updatePolicy(id, updateData));
      const results = await Promise.all(promises);
      console.log('Bulk update completed in MongoDB:', results);
      toast.success(`${policyIds.length} policies updated successfully`);
      return results;
    } catch (error) {
      console.error('Failed to bulk update policies in MongoDB:', error);
      toast.error(`Failed to bulk update policies: ${error.message}`);
      throw error;
    }
  }

  async bulkDeletePolicies(policyIds) {
    try {
      console.log('Bulk deleting policies from MongoDB:', policyIds);
      const promises = policyIds.map(id => this.deletePolicy(id));
      const results = await Promise.all(promises);
      console.log('Bulk delete completed in MongoDB:', results);
      toast.success(`${policyIds.length} policies deleted successfully`);
      return results;
    } catch (error) {
      console.error('Failed to bulk delete policies from MongoDB:', error);
      toast.error(`Failed to bulk delete policies: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
export const policiesApi = new PoliciesApiService();
export default policiesApi;
