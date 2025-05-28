
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api.js';

/**
 * Policies API Service
 * Handles all policy-related API requests with offline fallback
 * Follows the same pattern as clientsApi for consistency
 */

// Mock data for offline mode
const mockPoliciesData = [
  {
    id: 1,
    policyNumber: 'POL-2024-001',
    client: { id: 1, name: 'John Doe', email: 'john.doe@email.com' },
    type: 'Motor Insurance',
    status: 'Active',
    premium: 15000,
    sumAssured: 500000,
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    agent: { id: 1, name: 'Agent Smith' },
    paymentFrequency: 'Annual',
    nextPremiumDue: '2025-01-15',
    typeSpecificDetails: {
      vehicleNumber: 'TN01AB1234',
      vehicleType: 'Car',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS789012'
    },
    documents: {},
    history: [
      {
        action: 'Created',
        by: 'Admin',
        timestamp: '2024-01-15T10:00:00.000Z',
        details: 'Policy created'
      }
    ],
    renewals: [],
    payments: [],
    notes: []
  },
  {
    id: 2,
    policyNumber: 'POL-2024-002',
    client: { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com' },
    type: 'Health Insurance',
    status: 'Active',
    premium: 25000,
    sumAssured: 1000000,
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    agent: { id: 2, name: 'Agent Johnson' },
    paymentFrequency: 'Annual',
    nextPremiumDue: '2025-02-01',
    typeSpecificDetails: {
      familyMembers: [
        { name: 'Jane Smith', age: 35, relation: 'Self' },
        { name: 'John Smith', age: 37, relation: 'Spouse' }
      ],
      medicalHistory: 'None',
      preExistingConditions: 'None'
    },
    documents: {},
    history: [
      {
        action: 'Created',
        by: 'Admin',
        timestamp: '2024-02-01T10:00:00.000Z',
        details: 'Policy created'
      }
    ],
    renewals: [],
    payments: [],
    notes: []
  },
  {
    id: 3,
    policyNumber: 'POL-2024-003',
    client: { id: 3, name: 'Acme Corp', email: 'contact@acmecorp.com' },
    type: 'Property Insurance',
    status: 'Pending',
    premium: 50000,
    sumAssured: 2000000,
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    agent: { id: 1, name: 'Agent Smith' },
    paymentFrequency: 'Annual',
    nextPremiumDue: '2024-03-01',
    typeSpecificDetails: {
      propertyType: 'Commercial Building',
      address: '123 Business St, City, State',
      constructionType: 'Concrete',
      occupancy: 'Office',
      securityFeatures: ['CCTV', 'Security Guard', 'Fire Alarm']
    },
    documents: {},
    history: [
      {
        action: 'Created',
        by: 'Admin',
        timestamp: '2024-03-01T10:00:00.000Z',
        details: 'Policy created'
      }
    ],
    renewals: [],
    payments: [],
    notes: []
  }
];

class PoliciesApiService {
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
  getOfflinePolicies() {
    try {
      const stored = localStorage.getItem('policiesData');
      return stored ? JSON.parse(stored) : mockPoliciesData;
    } catch (error) {
      console.error('Error reading offline policies:', error);
      return mockPoliciesData;
    }
  }

  saveOfflinePolicies(policies) {
    try {
      localStorage.setItem('policiesData', JSON.stringify(policies));
    } catch (error) {
      console.error('Error saving offline policies:', error);
    }
  }

  /**
   * Get policies with filtering, sorting, and pagination
   */
  async getPolicies(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filtering
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      
      // Add sorting
      if (params.sortField) queryParams.append('sortField', params.sortField);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

      const endpoint = `${API_ENDPOINTS.POLICIES}?${queryParams.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const policies = this.getOfflinePolicies();
      
      // Apply filtering
      let filteredPolicies = policies;
      
      if (params.status && params.status !== 'all') {
        filteredPolicies = filteredPolicies.filter(p => 
          p.status.toLowerCase() === params.status.toLowerCase()
        );
      }
      
      if (params.type && params.type !== 'all') {
        filteredPolicies = filteredPolicies.filter(p => 
          p.type.toLowerCase().includes(params.type.toLowerCase())
        );
      }
      
      if (params.agentId && params.agentId !== 'all') {
        filteredPolicies = filteredPolicies.filter(p => 
          p.agent?.id?.toString() === params.agentId.toString()
        );
      }
      
      if (params.searchTerm) {
        const searchTerm = params.searchTerm.toLowerCase();
        filteredPolicies = filteredPolicies.filter(p => 
          p.policyNumber?.toLowerCase().includes(searchTerm) ||
          p.client?.name?.toLowerCase().includes(searchTerm) ||
          p.type?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (params.sortField) {
        filteredPolicies.sort((a, b) => {
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
        data: filteredPolicies.slice(startIndex, endIndex),
        total: filteredPolicies.length,
        page,
        limit,
        totalPages: Math.ceil(filteredPolicies.length / limit)
      };
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId) {
    try {
      const endpoint = API_ENDPOINTS.POLICY_BY_ID ? API_ENDPOINTS.POLICY_BY_ID(policyId) : `/policies/${policyId}`;
      return await this.request(endpoint);
    } catch (error) {
      // Offline fallback
      const policies = this.getOfflinePolicies();
      const policy = policies.find(p => p.id?.toString() === policyId?.toString());
      
      if (!policy) {
        throw new Error(`Policy with ID ${policyId} not found`);
      }
      
      return policy;
    }
  }

  /**
   * Create new policy
   */
  async createPolicy(policyData) {
    try {
      return await this.request(API_ENDPOINTS.POLICIES, {
        method: 'POST',
        body: JSON.stringify(policyData),
      });
    } catch (error) {
      // Offline fallback
      const policies = this.getOfflinePolicies();
      const newId = Math.max(...policies.map(p => p.id || 0), 0) + 1;
      
      const newPolicy = {
        ...policyData,
        id: newId,
        policyNumber: policyData.policyNumber || `POL-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`,
        history: [
          {
            action: 'Created',
            by: 'Admin',
            timestamp: new Date().toISOString(),
            details: 'Policy created'
          }
        ],
        documents: {},
        renewals: [],
        payments: [],
        notes: []
      };
      
      policies.push(newPolicy);
      this.saveOfflinePolicies(policies);
      
      return newPolicy;
    }
  }

  /**
   * Update existing policy
   */
  async updatePolicy(policyId, policyData) {
    try {
      const endpoint = API_ENDPOINTS.POLICY_BY_ID ? API_ENDPOINTS.POLICY_BY_ID(policyId) : `/policies/${policyId}`;
      return await this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(policyData),
      });
    } catch (error) {
      // Offline fallback
      const policies = this.getOfflinePolicies();
      const policyIndex = policies.findIndex(p => p.id?.toString() === policyId?.toString());
      
      if (policyIndex === -1) {
        throw new Error(`Policy with ID ${policyId} not found`);
      }
      
      const updatedPolicy = {
        ...policies[policyIndex],
        ...policyData,
        id: policies[policyIndex].id, // Preserve original ID
      };
      
      policies[policyIndex] = updatedPolicy;
      this.saveOfflinePolicies(policies);
      
      return updatedPolicy;
    }
  }

  /**
   * Delete policy
   */
  async deletePolicy(policyId) {
    try {
      const endpoint = API_ENDPOINTS.POLICY_BY_ID ? API_ENDPOINTS.POLICY_BY_ID(policyId) : `/policies/${policyId}`;
      return await this.request(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      // Offline fallback
      const policies = this.getOfflinePolicies();
      const policyIndex = policies.findIndex(p => p.id?.toString() === policyId?.toString());
      
      if (policyIndex === -1) {
        throw new Error(`Policy with ID ${policyId} not found`);
      }
      
      policies.splice(policyIndex, 1);
      this.saveOfflinePolicies(policies);
      
      return { success: true };
    }
  }
}

// Export singleton instance
export const policiesApi = new PoliciesApiService();
