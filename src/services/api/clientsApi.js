
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Clients API Service with MongoDB Integration
 */
class ClientsApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.CLIENTS);
  }

  async getClients(params = {}) {
    return this.getAll(params);
  }

  async getClientById(clientId) {
    return this.getById(clientId);
  }

  async createClient(clientData) {
    return this.create(clientData);
  }

  async updateClient(clientId, clientData) {
    return this.update(clientId, clientData);
  }

  async deleteClient(clientId) {
    return this.delete(clientId);
  }

  async searchClients(query, filters = {}) {
    const params = { search: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/search?${queryString}`);
  }

  async bulkUpdateClients(clientIds, updateData) {
    return this.makeRequest('/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ clientIds, updateData })
    });
  }

  async exportClients(exportData) {
    return this.export(exportData);
  }

  async getClientsByAgent(agentId) {
    return this.makeRequest(`/agent/${agentId}`);
  }

  async assignClientToAgent(clientId, agentId) {
    return this.makeRequest(`/${clientId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId })
    });
  }
}

export const clientsApi = new ClientsApiService();
export default clientsApi;
