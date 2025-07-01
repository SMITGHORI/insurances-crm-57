import { toast } from 'sonner';
import { ClientsBackendApiService } from './clientsApiBackend';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Mock data for offline/development mode
const mockClients = [
  {
    _id: '1',
    clientId: 'CL001',
    clientType: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '9876543210',
    type: 'Individual',
    contact: '9876543210',
    location: 'Mumbai, Maharashtra',
    status: 'Active',
    policies: 2,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    clientId: 'CL002',
    clientType: 'corporate',
    companyName: 'Tech Solutions Ltd',
    name: 'Tech Solutions Ltd',
    email: 'contact@techsolutions.com',
    phone: '9876543211',
    type: 'Corporate',
    contact: '9876543211',
    location: 'Delhi, Delhi',
    status: 'Active',
    policies: 5,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    _id: '3',
    clientId: 'CL003',
    clientType: 'group',
    groupName: 'Family Insurance Group',
    name: 'Family Insurance Group',
    email: 'family@insurance.com',
    phone: '9876543212',
    type: 'Group',
    contact: '9876543212',
    location: 'Bangalore, Karnataka',
    status: 'Pending',
    policies: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

/**
 * API service for client operations
 * Designed for Node.js + Express + MongoDB backend with fallback to mock data
 */
class ClientsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/clients`;
    this.isOfflineMode = false;
    this.backendApi = new ClientsBackendApiService();
    this.hasShownOfflineNotice = false;
  }

  /**
   * Check if we should use offline mode
   */
  async checkBackendAvailability() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generic API request handler with error handling and fallback
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
      ...options,
    };

    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      this.isOfflineMode = false;
      return await response.json();
    } catch (error) {
      console.warn('API Request failed, using offline mode:', error.message);
      
      // Switch to offline mode
      this.isOfflineMode = true;
      
      // Handle different endpoints with mock data
      if (endpoint === '' || endpoint.includes('?')) {
        return this.getMockClients(endpoint);
      }
      
      // For other endpoints, throw the error
      throw error;
    }
  }

  /**
   * Get mock clients data with filtering and pagination simulation
   */
  getMockClientsWithParams(params = {}) {
    let filteredClients = [...mockClients];
    
    const {
      search,
      type,
      status,
      sortField = 'createdAt',
      sortDirection = 'desc',
      page = 1,
      limit = 10
    } = params;
    
    // Apply search filter
    if (search) {
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.clientId.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply type filter
    if (type && type !== 'all') {
      filteredClients = filteredClients.filter(client =>
        client.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    // Apply status filter
    if (status && status !== 'All') {
      filteredClients = filteredClients.filter(client =>
        client.status === status
      );
    }
    
    // Apply sorting
    filteredClients.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    return {
      data: paginatedClients,
      total: filteredClients.length,
      totalPages: Math.ceil(filteredClients.length / limit),
      currentPage: page,
      success: true
    };
  }

  /**
   * Get all clients with optional filtering and pagination
   */
  async getClients(params = {}) {
    try {
      // Try backend API first
      const result = await this.backendApi.getClients(params);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Show offline mode notification once
      if (!this.hasShownOfflineNotice) {
        toast.info('Working in offline mode with sample data');
        this.hasShownOfflineNotice = true;
      }
      
      // Fall back to mock data
      return this.getMockClientsWithParams(params);
    }
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id) {
    try {
      // Try backend API first
      const result = await this.backendApi.getClientById(id);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for getClientById, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Return mock client if offline
      const mockClient = mockClients.find(c => c._id === id);
      if (mockClient) {
        return mockClient;
      }
      throw error;
    }
  }

  /**
   * Create a new client
   */
  async createClient(clientData) {
    try {
      // Try backend API first
      const result = await this.backendApi.createClient(clientData);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for createClient, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Simulate successful creation in offline mode
      const newClient = {
        _id: Date.now().toString(),
        clientId: `CL${String(mockClients.length + 1).padStart(3, '0')}`,
        ...clientData,
        name: this.getClientDisplayName(clientData),
        type: this.capitalizeFirst(clientData.clientType),
        contact: clientData.phone,
        location: `${clientData.city}, ${clientData.state}`,
        status: 'Active',
        policies: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockClients.push(newClient);
      toast.success('Client created successfully (offline mode)');
      return newClient;
    }
  }

  /**
   * Update an existing client
   */
  async updateClient(id, clientData) {
    try {
      // Try backend API first
      const result = await this.backendApi.updateClient(id, clientData);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for updateClient, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Simulate successful update in offline mode
      const clientIndex = mockClients.findIndex(c => c._id === id);
      if (clientIndex !== -1) {
        mockClients[clientIndex] = {
          ...mockClients[clientIndex],
          ...clientData,
          name: this.getClientDisplayName(clientData),
          type: this.capitalizeFirst(clientData.clientType),
          updatedAt: new Date()
        };
        toast.success('Client updated successfully (offline mode)');
        return mockClients[clientIndex];
      }
      throw error;
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(id) {
    try {
      // Try backend API first
      const result = await this.backendApi.deleteClient(id);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for deleteClient, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Simulate successful deletion in offline mode
      const clientIndex = mockClients.findIndex(c => c._id === id);
      if (clientIndex !== -1) {
        mockClients.splice(clientIndex, 1);
        toast.success('Client deleted successfully (offline mode)');
        return { success: true };
      }
      throw error;
    }
  }

  /**
   * Upload client document
   */
  async uploadDocument(clientId, documentType, file) {
    try {
      // Try backend API first
      const result = await this.backendApi.uploadDocument(clientId, documentType, file);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for uploadDocument, using offline mode:', error.message);
      this.isOfflineMode = true;
      throw error; // Document upload requires backend
    }
  }

  /**
   * Get client documents
   */
  async getClientDocuments(clientId) {
    try {
      // Try backend API first
      const result = await this.backendApi.getClientDocuments(clientId);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for getClientDocuments, using offline mode:', error.message);
      this.isOfflineMode = true;
      return []; // Return empty array for offline mode
    }
  }

  /**
   * Delete client document
   */
  async deleteDocument(clientId, documentId) {
    try {
      // Try backend API first
      const result = await this.backendApi.deleteDocument(clientId, documentId);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for deleteDocument, using offline mode:', error.message);
      this.isOfflineMode = true;
      throw error; // Document deletion requires backend
    }
  }

  /**
   * Helper method to get client display name
   */
  getClientDisplayName(clientData) {
    switch (clientData.clientType) {
      case 'individual':
        return `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim();
      case 'corporate':
        return clientData.companyName || 'Corporate Client';
      case 'group':
        return clientData.groupName || 'Group Client';
      default:
        return 'Unknown Client';
    }
  }

  /**
   * Search clients
   */
  async searchClients(query, limit = 10) {
    try {
      // Try backend API first
      const result = await this.backendApi.searchClients(query, limit);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for searchClients, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Search in mock data
      const filteredClients = mockClients.filter(client =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase()) ||
        client.clientId.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      
      return filteredClients;
    }
  }

  /**
   * Get clients by agent
   */
  async getClientsByAgent(agentId) {
    try {
      // Try backend API first
      const result = await this.backendApi.getClientsByAgent(agentId);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for getClientsByAgent, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Filter mock clients by agent
      return mockClients.filter(client => client.assignedAgentId === agentId);
    }
  }

  /**
   * Assign client to agent
   */
  async assignClientToAgent(clientId, agentId) {
    try {
      // Try backend API first
      const result = await this.backendApi.assignClientToAgent(clientId, agentId);
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for assignClientToAgent, using offline mode:', error.message);
      this.isOfflineMode = true;
      throw error; // Assignment requires backend
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    try {
      // Try backend API first
      const result = await this.backendApi.getClientStats();
      this.isOfflineMode = false;
      return result;
    } catch (error) {
      console.warn('Backend API failed for getClientStats, using offline mode:', error.message);
      this.isOfflineMode = true;
      
      // Return mock stats
      return {
        totalClients: mockClients.length,
        activeClients: mockClients.filter(c => c.status === 'Active').length,
        pendingClients: mockClients.filter(c => c.status === 'Pending').length,
        inactiveClients: mockClients.filter(c => c.status === 'Inactive').length,
        individualClients: mockClients.filter(c => c.type === 'Individual').length,
        corporateClients: mockClients.filter(c => c.type === 'Corporate').length,
        groupClients: mockClients.filter(c => c.type === 'Group').length
      };
    }
  }

  /**
   * Helper method to get client display name
   */
  getClientDisplayName(clientData) {
    switch (clientData.clientType) {
      case 'individual':
        return `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim();
      case 'corporate':
        return clientData.companyName || 'Corporate Client';
      case 'group':
        return clientData.groupName || 'Group Client';
      default:
        return 'Unknown Client';
    }
  }

  /**
   * Helper method to capitalize first letter
   */
  capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
}

// Export singleton instance
export const clientsApi = new ClientsApiService();
export default clientsApi;
