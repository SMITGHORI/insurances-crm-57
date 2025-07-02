
import { toast } from 'sonner';
import { ClientsBackendApiService } from './clientsApiBackend';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * API service for client operations
 * Connects directly to Node.js + Express + MongoDB backend
 */
class ClientsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/clients`;
    this.backendApi = new ClientsBackendApiService();
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
   * Get all clients with filtering and pagination
   */
  async getClients(params = {}) {
    try {
      const result = await this.backendApi.getClients(params);
      console.log('Clients fetched from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch clients from database:', error);
      toast.error('Failed to load clients from database');
      throw error;
    }
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id) {
    try {
      const result = await this.backendApi.getClientById(id);
      console.log('Client fetched from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch client from database:', error);
      toast.error('Failed to load client details');
      throw error;
    }
  }

  /**
   * Create a new client
   */
  async createClient(clientData) {
    try {
      console.log('Creating client in database:', clientData);
      const result = await this.backendApi.createClient(clientData);
      console.log('Client created in database:', result);
      toast.success('Client created successfully');
      return result;
    } catch (error) {
      console.error('Failed to create client in database:', error);
      toast.error(`Failed to create client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing client
   */
  async updateClient(id, clientData) {
    try {
      console.log('Updating client in database:', { id, clientData });
      const result = await this.backendApi.updateClient(id, clientData);
      console.log('Client updated in database:', result);
      toast.success('Client updated successfully');
      return result;
    } catch (error) {
      console.error('Failed to update client in database:', error);
      toast.error(`Failed to update client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(id) {
    try {
      console.log('Deleting client from database:', id);
      const result = await this.backendApi.deleteClient(id);
      console.log('Client deleted from database:', result);
      toast.success('Client deleted successfully');
      return result;
    } catch (error) {
      console.error('Failed to delete client from database:', error);
      toast.error(`Failed to delete client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload client document
   */
  async uploadDocument(clientId, documentType, file) {
    try {
      console.log('Uploading document to database:', { clientId, documentType, fileName: file.name });
      const result = await this.backendApi.uploadDocument(clientId, documentType, file);
      console.log('Document uploaded to database:', result);
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`);
      return result;
    } catch (error) {
      console.error('Failed to upload document to database:', error);
      toast.error(`Failed to upload ${documentType} document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get client documents
   */
  async getClientDocuments(clientId) {
    try {
      console.log('Fetching client documents from database:', clientId);
      const result = await this.backendApi.getClientDocuments(clientId);
      console.log('Client documents fetched from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch client documents from database:', error);
      toast.error('Failed to load client documents');
      throw error;
    }
  }

  /**
   * Delete client document
   */
  async deleteDocument(clientId, documentId) {
    try {
      console.log('Deleting document from database:', { clientId, documentId });
      const result = await this.backendApi.deleteDocument(clientId, documentId);
      console.log('Document deleted from database:', result);
      toast.success('Document deleted successfully');
      return result;
    } catch (error) {
      console.error('Failed to delete document from database:', error);
      toast.error(`Failed to delete document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search clients
   */
  async searchClients(query, limit = 10) {
    try {
      console.log('Searching clients in database:', { query, limit });
      const result = await this.backendApi.searchClients(query, limit);
      console.log('Client search results from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to search clients in database:', error);
      toast.error('Failed to search clients');
      throw error;
    }
  }

  /**
   * Get clients by agent
   */
  async getClientsByAgent(agentId) {
    try {
      console.log('Fetching clients by agent from database:', agentId);
      const result = await this.backendApi.getClientsByAgent(agentId);
      console.log('Agent clients fetched from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch agent clients from database:', error);
      toast.error('Failed to load agent clients');
      throw error;
    }
  }

  /**
   * Assign client to agent
   */
  async assignClientToAgent(clientId, agentId) {
    try {
      console.log('Assigning client to agent in database:', { clientId, agentId });
      const result = await this.backendApi.assignClientToAgent(clientId, agentId);
      console.log('Client assigned to agent in database:', result);
      toast.success('Client assigned successfully');
      return result;
    } catch (error) {
      console.error('Failed to assign client to agent in database:', error);
      toast.error(`Failed to assign client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    try {
      console.log('Fetching client statistics from database');
      const result = await this.backendApi.getClientStats();
      console.log('Client statistics fetched from database:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch client statistics from database:', error);
      toast.error('Failed to load client statistics');
      throw error;
    }
  }

  /**
   * Export clients data
   */
  async exportClients(exportData) {
    try {
      console.log('Exporting clients from database:', exportData);
      const result = await this.backendApi.exportClients(exportData);
      console.log('Clients exported from database:', result);
      toast.success('Clients exported successfully');
      return result;
    } catch (error) {
      console.error('Failed to export clients from database:', error);
      toast.error(`Failed to export clients: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateClients(clientIds, updateData) {
    try {
      console.log('Bulk updating clients in database:', { clientIds, updateData });
      const promises = clientIds.map(id => this.updateClient(id, updateData));
      const results = await Promise.all(promises);
      console.log('Bulk update completed in database:', results);
      toast.success(`${clientIds.length} clients updated successfully`);
      return results;
    } catch (error) {
      console.error('Failed to bulk update clients in database:', error);
      toast.error(`Failed to bulk update clients: ${error.message}`);
      throw error;
    }
  }

  async bulkDeleteClients(clientIds) {
    try {
      console.log('Bulk deleting clients from database:', clientIds);
      const promises = clientIds.map(id => this.deleteClient(id));
      const results = await Promise.all(promises);
      console.log('Bulk delete completed in database:', results);
      toast.success(`${clientIds.length} clients deleted successfully`);
      return results;
    } catch (error) {
      console.error('Failed to bulk delete clients from database:', error);
      toast.error(`Failed to bulk delete clients: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
export const clientsApi = new ClientsApiService();
export default clientsApi;
