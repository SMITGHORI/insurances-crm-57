
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Agents API Service with MongoDB Integration
 */
class AgentsApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.AGENTS);
  }

  async getAgents(params = {}) {
    return this.getAll(params);
  }

  async getAgentById(agentId) {
    return this.getById(agentId);
  }

  async createAgent(agentData) {
    return this.create(agentData);
  }

  async updateAgent(agentId, agentData) {
    return this.update(agentId, agentData);
  }

  async deleteAgent(agentId) {
    return this.delete(agentId);
  }

  async getAgentClients(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/${agentId}/clients?${queryString}` : `/${agentId}/clients`;
    return this.makeRequest(endpoint);
  }

  async getAgentPolicies(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/${agentId}/policies?${queryString}` : `/${agentId}/policies`;
    return this.makeRequest(endpoint);
  }

  async getAgentCommissions(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/${agentId}/commissions?${queryString}` : `/${agentId}/commissions`;
    return this.makeRequest(endpoint);
  }

  async getAgentPerformance(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/${agentId}/performance?${queryString}` : `/${agentId}/performance`;
    return this.makeRequest(endpoint);
  }
}

export const agentsApi = new AgentsApiService();
export default agentsApi;
