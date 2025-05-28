
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Agents API Service
 * Handles all agent-related API requests with offline fallback
 * Follows the same pattern as clientsApi for consistency
 */

// Mock data for offline mode
const mockAgentsData = [
  {
    id: 1,
    name: 'Agent Smith',
    email: 'agent.smith@amba.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    status: 'active',
    specialization: 'Health Insurance',
    clientsCount: 45,
    policiesCount: 78,
    premiumGenerated: '₹18,50,000',
    commissionEarned: '₹2,96,000',
    conversionRate: '78%',
    joinDate: '2023-01-15',
    licenseNumber: 'LIC123456789',
    address: '123 Business St, Mumbai, Maharashtra 400001',
    territory: 'Mumbai Central',
    manager: 'Regional Manager',
    targetAchievement: 95,
    documents: {},
    notes: []
  },
  {
    id: 2,
    name: 'Agent Johnson',
    email: 'agent.johnson@amba.com',
    phone: '+91 87654 32109',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    status: 'active',
    specialization: 'Motor Insurance',
    clientsCount: 38,
    policiesCount: 65,
    premiumGenerated: '₹15,40,000',
    commissionEarned: '₹2,46,400',
    conversionRate: '72%',
    joinDate: '2023-03-22',
    licenseNumber: 'LIC987654321',
    address: '456 Agent Ave, Delhi, Delhi 110001',
    territory: 'Delhi NCR',
    manager: 'Regional Manager',
    targetAchievement: 88,
    documents: {},
    notes: []
  },
  {
    id: 3,
    name: 'Agent Davis',
    email: 'agent.davis@amba.com',
    phone: '+91 76543 21098',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    status: 'onboarding',
    specialization: 'Life Insurance',
    clientsCount: 12,
    policiesCount: 18,
    premiumGenerated: '₹5,60,000',
    commissionEarned: '₹89,600',
    conversionRate: '65%',
    joinDate: '2024-11-01',
    licenseNumber: 'LIC456789123',
    address: '789 New Agent Rd, Bangalore, Karnataka 560001',
    territory: 'Bangalore East',
    manager: 'Regional Manager',
    targetAchievement: 45,
    documents: {},
    notes: []
  },
  {
    id: 4,
    name: 'Agent Wilson',
    email: 'agent.wilson@amba.com',
    phone: '+91 65432 10987',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
    status: 'inactive',
    specialization: 'Property Insurance',
    clientsCount: 25,
    policiesCount: 42,
    premiumGenerated: '₹12,30,000',
    commissionEarned: '₹1,96,800',
    conversionRate: '68%',
    joinDate: '2022-08-10',
    licenseNumber: 'LIC789123456',
    address: '321 Insurance Plaza, Chennai, Tamil Nadu 600001',
    territory: 'Chennai South',
    manager: 'Regional Manager',
    targetAchievement: 70,
    documents: {},
    notes: []
  }
];

class AgentsApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    this.isOfflineMode = false;
  }

  /**
   * Generic request method with retry logic and offline fallback
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.isOfflineMode = false;
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.warn(`API Request failed (attempt ${attempt}):`, error.message);
        
        if (attempt === this.retryAttempts) {
          console.warn('API Request failed, using offline mode:', error.message);
          this.isOfflineMode = true;
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  /**
   * Offline fallback methods using localStorage and mock data
   */
  getOfflineAgents() {
    try {
      const stored = localStorage.getItem('agentsData');
      return stored ? JSON.parse(stored) : mockAgentsData;
    } catch (error) {
      console.error('Error reading offline agents:', error);
      return mockAgentsData;
    }
  }

  saveOfflineAgents(agents) {
    try {
      localStorage.setItem('agentsData', JSON.stringify(agents));
    } catch (error) {
      console.error('Error saving offline agents:', error);
    }
  }

  /**
   * Get agents with filtering, sorting, and pagination
   */
  async getAgents(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filtering
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.specialization && params.specialization !== 'all') queryParams.append('specialization', params.specialization);
      if (params.territory && params.territory !== 'all') queryParams.append('territory', params.territory);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      
      // Add sorting
      if (params.sortField) queryParams.append('sortField', params.sortField);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

      const endpoint = `${API_ENDPOINTS.AGENTS}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const agents = this.getOfflineAgents();
      
      // Apply filtering
      let filteredAgents = agents;
      
      if (params.status && params.status !== 'all') {
        filteredAgents = filteredAgents.filter(a => 
          a.status.toLowerCase() === params.status.toLowerCase()
        );
      }
      
      if (params.specialization && params.specialization !== 'all') {
        filteredAgents = filteredAgents.filter(a => 
          a.specialization.toLowerCase().includes(params.specialization.toLowerCase())
        );
      }
      
      if (params.territory && params.territory !== 'all') {
        filteredAgents = filteredAgents.filter(a => 
          a.territory?.toLowerCase().includes(params.territory.toLowerCase())
        );
      }
      
      if (params.searchTerm) {
        const searchTerm = params.searchTerm.toLowerCase();
        filteredAgents = filteredAgents.filter(a => 
          a.name?.toLowerCase().includes(searchTerm) ||
          a.email?.toLowerCase().includes(searchTerm) ||
          a.phone?.toLowerCase().includes(searchTerm) ||
          a.specialization?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (params.sortField) {
        filteredAgents.sort((a, b) => {
          const aVal = a[params.sortField];
          const bVal = b[params.sortField];
          
          if (params.sortDirection === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      
      // Apply pagination
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: filteredAgents.slice(startIndex, endIndex),
        total: filteredAgents.length,
        page,
        limit,
        totalPages: Math.ceil(filteredAgents.length / limit)
      };
    }
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId) {
    try {
      const endpoint = API_ENDPOINTS.AGENT_BY_ID(agentId);
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const agents = this.getOfflineAgents();
      const agent = agents.find(a => a.id?.toString() === agentId?.toString());
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      return agent;
    }
  }

  /**
   * Create new agent
   */
  async createAgent(agentData) {
    try {
      return await this.request(API_ENDPOINTS.AGENTS, {
        method: 'POST',
        body: JSON.stringify(agentData),
      });
    } catch (error) {
      // Offline fallback
      const agents = this.getOfflineAgents();
      const newId = Math.max(...agents.map(a => a.id || 0), 0) + 1;
      
      const newAgent = {
        ...agentData,
        id: newId,
        clientsCount: 0,
        policiesCount: 0,
        premiumGenerated: '₹0',
        commissionEarned: '₹0',
        conversionRate: '0%',
        targetAchievement: 0,
        joinDate: new Date().toISOString().split('T')[0],
        documents: {},
        notes: []
      };
      
      agents.push(newAgent);
      this.saveOfflineAgents(agents);
      
      return newAgent;
    }
  }

  /**
   * Update existing agent
   */
  async updateAgent(agentId, agentData) {
    try {
      const endpoint = API_ENDPOINTS.AGENT_BY_ID(agentId);
      return await this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(agentData),
      });
    } catch (error) {
      // Offline fallback
      const agents = this.getOfflineAgents();
      const agentIndex = agents.findIndex(a => a.id?.toString() === agentId?.toString());
      
      if (agentIndex === -1) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      const updatedAgent = {
        ...agents[agentIndex],
        ...agentData,
        id: agents[agentIndex].id, // Preserve original ID
      };
      
      agents[agentIndex] = updatedAgent;
      this.saveOfflineAgents(agents);
      
      return updatedAgent;
    }
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId) {
    try {
      const endpoint = API_ENDPOINTS.AGENT_BY_ID(agentId);
      return await this.request(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      // Offline fallback
      const agents = this.getOfflineAgents();
      const agentIndex = agents.findIndex(a => a.id?.toString() === agentId?.toString());
      
      if (agentIndex === -1) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      agents.splice(agentIndex, 1);
      this.saveOfflineAgents(agents);
      
      return { success: true };
    }
  }

  /**
   * Get agent's clients
   */
  async getAgentClients(agentId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const endpoint = `${API_ENDPOINTS.AGENT_CLIENTS(agentId)}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback - return empty data structure
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 10,
        totalPages: 0
      };
    }
  }

  /**
   * Get agent's policies
   */
  async getAgentPolicies(agentId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const endpoint = `${API_ENDPOINTS.AGENT_POLICIES(agentId)}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback - return empty data structure
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 10,
        totalPages: 0
      };
    }
  }

  /**
   * Get agent's commission data
   */
  async getAgentCommissions(agentId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const endpoint = `${API_ENDPOINTS.AGENT_COMMISSIONS(agentId)}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback - return empty data structure
      return {
        data: [],
        total: 0,
        summary: {
          totalCommission: 0,
          paidCommission: 0,
          pendingCommission: 0
        }
      };
    }
  }

  /**
   * Get agent's performance data
   */
  async getAgentPerformance(agentId, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.year) queryParams.append('year', params.year);
      
      const endpoint = `${API_ENDPOINTS.AGENT_PERFORMANCE(agentId)}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback - return empty data structure
      return {
        kpis: {
          activitiesThisMonth: {},
          performanceTrends: {},
          trainingCompliance: {}
        },
        charts: {
          monthlySales: [],
          policyCategoryDistribution: [],
          quarterlyTargets: []
        }
      };
    }
  }
}

// Export singleton instance
export const agentsApi = new AgentsApiService();
