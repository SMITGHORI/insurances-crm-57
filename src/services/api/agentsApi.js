
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Agents API Service
 * Handles all agent-related API operations
 */
class AgentsApiService {
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
      console.error('Agents API Request failed:', error);
      throw error;
    }
  }

  async getAgents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENTS}?${queryString}` : API_ENDPOINTS.AGENTS;
    return this.makeRequest(endpoint);
  }

  async getAgentById(agentId) {
    return this.makeRequest(API_ENDPOINTS.AGENT_BY_ID(agentId));
  }

  async createAgent(agentData) {
    return this.makeRequest(API_ENDPOINTS.AGENTS, {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  }

  async updateAgent(agentId, agentData) {
    return this.makeRequest(API_ENDPOINTS.AGENT_BY_ID(agentId), {
      method: 'PUT',
      body: JSON.stringify(agentData)
    });
  }

  async deleteAgent(agentId) {
    return this.makeRequest(API_ENDPOINTS.AGENT_BY_ID(agentId), {
      method: 'DELETE'
    });
  }

  async getAgentClients(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENT_CLIENTS(agentId)}?${queryString}` : API_ENDPOINTS.AGENT_CLIENTS(agentId);
    return this.makeRequest(endpoint);
  }

  async getAgentPolicies(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENT_POLICIES(agentId)}?${queryString}` : API_ENDPOINTS.AGENT_POLICIES(agentId);
    return this.makeRequest(endpoint);
  }

  async getAgentCommissions(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENT_COMMISSIONS(agentId)}?${queryString}` : API_ENDPOINTS.AGENT_COMMISSIONS(agentId);
    return this.makeRequest(endpoint);
  }

  async getAgentPerformance(agentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENT_PERFORMANCE(agentId)}?${queryString}` : API_ENDPOINTS.AGENT_PERFORMANCE(agentId);
    return this.makeRequest(endpoint);
  }
}

export const agentsApi = new AgentsApiService();
