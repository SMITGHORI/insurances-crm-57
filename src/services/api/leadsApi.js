
/**
 * Leads API service for MongoDB/Node.js/Express backend integration
 * Provides offline fallback with sample data for development
 * Optimized for MERN stack backend integration
 */

import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

// Sample leads data for offline mode (MongoDB-like structure)
const sampleLeads = [
  {
    _id: '674a1b2c3d4e5f6789012345',
    leadId: 'LD001',
    name: 'Arun Sharma',
    phone: '9876543210',
    email: 'arun.sharma@example.com',
    address: '123 Main Street, Mumbai, Maharashtra',
    source: 'Website',
    product: 'Health Insurance',
    status: 'New',
    budget: 500000,
    assignedTo: {
      agentId: '674a1b2c3d4e5f6789012301',
      name: 'Raj Malhotra'
    },
    priority: 'High',
    additionalInfo: 'Looking for family health insurance plan for 4 members',
    followUps: [
      {
        _id: '674a1b2c3d4e5f6789012401',
        date: '2025-05-15',
        time: '15:30',
        type: 'Call',
        outcome: 'Discussed plan options. Client is interested in premium plans.',
        nextAction: 'Send brochures for selected plans',
        createdBy: 'Raj Malhotra',
        createdAt: new Date('2025-05-15T15:30:00Z')
      }
    ],
    notes: [
      {
        _id: '674a1b2c3d4e5f6789012501',
        content: 'Client has specific requirements for maternity coverage',
        createdBy: 'Raj Malhotra',
        createdAt: new Date('2025-05-15T10:00:00Z')
      }
    ],
    nextFollowUp: new Date('2025-05-22'),
    lastInteraction: new Date('2025-05-15'),
    createdAt: new Date('2025-04-10'),
    updatedAt: new Date('2025-05-15'),
    __v: 0
  },
  {
    _id: '674a1b2c3d4e5f6789012346',
    leadId: 'LD002',
    name: 'Priya Patel',
    phone: '8765432109',
    email: 'priya.patel@example.com',
    address: '456 Garden Road, Delhi',
    source: 'Referral',
    product: 'Term Life Insurance',
    status: 'In Progress',
    budget: 750000,
    assignedTo: {
      agentId: '674a1b2c3d4e5f6789012302',
      name: 'Anita Kumar'
    },
    priority: 'Medium',
    additionalInfo: 'Needs a long-term investment plan with life coverage',
    followUps: [],
    notes: [],
    nextFollowUp: new Date('2025-05-25'),
    lastInteraction: new Date('2025-05-16'),
    createdAt: new Date('2025-04-12'),
    updatedAt: new Date('2025-05-16'),
    __v: 0
  },
  {
    _id: '674a1b2c3d4e5f6789012347',
    leadId: 'LD003',
    name: 'Vikram Singh',
    phone: '7654321098',
    email: 'vikram.singh@example.com',
    address: '789 Business District, Bangalore',
    source: 'Cold Call',
    product: 'Motor Insurance',
    status: 'Qualified',
    budget: 200000,
    assignedTo: {
      agentId: '674a1b2c3d4e5f6789012301',
      name: 'Raj Malhotra'
    },
    priority: 'Low',
    additionalInfo: 'Has multiple vehicles and looking for fleet insurance',
    followUps: [],
    notes: [],
    nextFollowUp: new Date('2025-05-24'),
    lastInteraction: new Date('2025-05-14'),
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-05-14'),
    __v: 0
  },
  {
    _id: '674a1b2c3d4e5f6789012348',
    leadId: 'LD004',
    name: 'Sunita Gupta',
    phone: '9988776655',
    email: 'sunita.gupta@example.com',
    address: '321 Residential Area, Pune',
    source: 'Event',
    product: 'Home Insurance',
    status: 'Not Interested',
    budget: 300000,
    assignedTo: {
      agentId: '674a1b2c3d4e5f6789012303',
      name: 'Vikram Mehta'
    },
    priority: 'Medium',
    additionalInfo: 'Recently purchased new property',
    followUps: [],
    notes: [],
    nextFollowUp: new Date('2025-06-15'),
    lastInteraction: new Date('2025-05-10'),
    createdAt: new Date('2025-04-18'),
    updatedAt: new Date('2025-05-10'),
    __v: 0
  },
  {
    _id: '674a1b2c3d4e5f6789012349',
    leadId: 'LD005',
    name: 'Rahul Verma',
    phone: '9876123450',
    email: 'rahul.verma@example.com',
    address: '654 Tech Park, Hyderabad',
    source: 'Social Media',
    product: 'Travel Insurance',
    status: 'In Progress',
    budget: 150000,
    assignedTo: {
      agentId: '674a1b2c3d4e5f6789012302',
      name: 'Anita Kumar'
    },
    priority: 'High',
    additionalInfo: 'Planning international trip in June',
    followUps: [],
    notes: [],
    nextFollowUp: new Date('2025-05-28'),
    lastInteraction: new Date('2025-05-18'),
    createdAt: new Date('2025-04-20'),
    updatedAt: new Date('2025-05-18'),
    __v: 0
  }
];

class LeadsAPI {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    this.isOfflineMode = false;
  }

  // Generic fetch wrapper with retry logic
  async fetchWithRetry(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const fetchOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let lastError;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.isOfflineMode = false;
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`API request failed (attempt ${attempt + 1}):`, error.message);

        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    console.error('All API retry attempts failed, switching to offline mode');
    this.isOfflineMode = true;
    throw lastError;
  }

  // Transform lead data for frontend consumption
  transformLeadForFrontend(lead) {
    return {
      id: lead.leadId || lead._id,
      _id: lead._id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      source: lead.source,
      product: lead.product,
      status: lead.status,
      budget: lead.budget ? `₹${lead.budget.toLocaleString()}` : '',
      assignedTo: lead.assignedTo?.name || lead.assignedTo,
      priority: lead.priority,
      additionalInfo: lead.additionalInfo,
      followUps: lead.followUps || [],
      notes: lead.notes || [],
      nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().split('T')[0] : '',
      lastInteraction: lead.lastInteraction ? new Date(lead.lastInteraction).toISOString().split('T')[0] : '',
      createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : '',
      updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString().split('T')[0] : ''
    };
  }

  // Transform frontend data for backend submission
  transformLeadForBackend(leadData) {
    return {
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      address: leadData.address,
      source: leadData.source,
      product: leadData.product,
      status: leadData.status,
      budget: leadData.budget ? parseInt(leadData.budget.replace(/[^\d]/g, '')) : null,
      assignedTo: {
        name: leadData.assignedTo
      },
      priority: leadData.priority,
      additionalInfo: leadData.additionalInfo,
      nextFollowUp: leadData.nextFollowUp ? new Date(leadData.nextFollowUp) : null,
      lastInteraction: leadData.lastInteraction ? new Date(leadData.lastInteraction) : null
    };
  }

  // Get all leads with filtering and pagination
  async getLeads(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.source && params.source !== 'all') queryParams.append('source', params.source);
      if (params.assignedTo && params.assignedTo !== 'all') queryParams.append('assignedTo', params.assignedTo);
      if (params.priority && params.priority !== 'all') queryParams.append('priority', params.priority);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${this.baseURL}${API_ENDPOINTS.LEADS}?${queryParams}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      return {
        leads: data.leads.map(lead => this.transformLeadForFrontend(lead)),
        pagination: data.pagination,
        totalCount: data.totalCount
      };
    } catch (error) {
      console.warn('Failed to fetch leads from API, using sample data:', error.message);
      
      // Return sample data in offline mode
      let filteredLeads = [...sampleLeads];
      
      // Apply filters to sample data
      if (params.status && params.status !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.status === params.status);
      }
      if (params.source && params.source !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.source === params.source);
      }
      if (params.assignedTo && params.assignedTo !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.assignedTo.name === params.assignedTo);
      }
      if (params.priority && params.priority !== 'all') {
        filteredLeads = filteredLeads.filter(lead => lead.priority === params.priority);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredLeads = filteredLeads.filter(lead => 
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchLower) ||
          lead.leadId.toLowerCase().includes(searchLower)
        );
      }

      return {
        leads: filteredLeads.map(lead => this.transformLeadForFrontend(lead)),
        pagination: {
          currentPage: parseInt(params.page) || 1,
          totalPages: Math.ceil(filteredLeads.length / (parseInt(params.limit) || 10)),
          hasNext: false,
          hasPrev: false
        },
        totalCount: filteredLeads.length
      };
    }
  }

  // Get lead by ID
  async getLeadById(leadId) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_BY_ID(leadId)}`;
      const response = await this.fetchWithRetry(url);
      const lead = await response.json();

      return this.transformLeadForFrontend(lead);
    } catch (error) {
      console.warn(`Failed to fetch lead ${leadId} from API, using sample data:`, error.message);
      
      const lead = sampleLeads.find(l => l.leadId === leadId || l._id === leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      return this.transformLeadForFrontend(lead);
    }
  }

  // Create new lead
  async createLead(leadData) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEADS}`;
      const transformedData = this.transformLeadForBackend(leadData);

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(transformedData),
      });

      const newLead = await response.json();
      return this.transformLeadForFrontend(newLead);
    } catch (error) {
      console.warn('Failed to create lead via API, using mock response:', error.message);
      
      // Mock successful creation for offline mode
      const mockLead = {
        _id: `674a1b2c3d4e5f6789${Date.now()}`,
        leadId: `LD${String(Date.now()).slice(-3)}`,
        ...this.transformLeadForBackend(leadData),
        followUps: [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };

      return this.transformLeadForFrontend(mockLead);
    }
  }

  // Update existing lead
  async updateLead(leadId, leadData) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_BY_ID(leadId)}`;
      const transformedData = this.transformLeadForBackend(leadData);

      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify(transformedData),
      });

      const updatedLead = await response.json();
      return this.transformLeadForFrontend(updatedLead);
    } catch (error) {
      console.warn(`Failed to update lead ${leadId} via API, using mock response:`, error.message);
      
      // Mock successful update for offline mode
      const existingLead = sampleLeads.find(l => l.leadId === leadId || l._id === leadId);
      if (!existingLead) {
        throw new Error('Lead not found');
      }

      const mockUpdatedLead = {
        ...existingLead,
        ...this.transformLeadForBackend(leadData),
        updatedAt: new Date()
      };

      return this.transformLeadForFrontend(mockUpdatedLead);
    }
  }

  // Delete lead
  async deleteLead(leadId) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_BY_ID(leadId)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'DELETE',
      });

      return await response.json();
    } catch (error) {
      console.warn(`Failed to delete lead ${leadId} via API, using mock response:`, error.message);
      
      // Mock successful deletion for offline mode
      return { success: true, message: 'Lead deleted successfully (offline mode)' };
    }
  }

  // Add follow-up to lead
  async addFollowUp(leadId, followUpData) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_FOLLOWUPS(leadId)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(followUpData),
      });

      return await response.json();
    } catch (error) {
      console.warn(`Failed to add follow-up to lead ${leadId} via API, using mock response:`, error.message);
      
      // Mock successful follow-up creation
      const mockFollowUp = {
        _id: `674a1b2c3d4e5f6789${Date.now()}`,
        ...followUpData,
        createdAt: new Date()
      };

      return mockFollowUp;
    }
  }

  // Add note to lead
  async addNote(leadId, noteData) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_NOTES(leadId)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify(noteData),
      });

      return await response.json();
    } catch (error) {
      console.warn(`Failed to add note to lead ${leadId} via API, using mock response:`, error.message);
      
      // Mock successful note creation
      const mockNote = {
        _id: `674a1b2c3d4e5f6789${Date.now()}`,
        ...noteData,
        createdAt: new Date()
      };

      return mockNote;
    }
  }

  // Assign lead to agent
  async assignLead(leadId, agentData) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_ASSIGN(leadId)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'PUT',
        body: JSON.stringify(agentData),
      });

      const updatedLead = await response.json();
      return this.transformLeadForFrontend(updatedLead);
    } catch (error) {
      console.warn(`Failed to assign lead ${leadId} via API, using mock response:`, error.message);
      
      // Mock successful assignment
      const existingLead = sampleLeads.find(l => l.leadId === leadId || l._id === leadId);
      if (!existingLead) {
        throw new Error('Lead not found');
      }

      const mockUpdatedLead = {
        ...existingLead,
        assignedTo: agentData,
        updatedAt: new Date()
      };

      return this.transformLeadForFrontend(mockUpdatedLead);
    }
  }

  // Convert lead to client
  async convertToClient(leadId) {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.LEAD_CONVERT(leadId)}`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
      });

      return await response.json();
    } catch (error) {
      console.warn(`Failed to convert lead ${leadId} to client via API, using mock response:`, error.message);
      
      // Mock successful conversion
      return {
        success: true,
        clientId: `CL${Date.now()}`,
        message: 'Lead converted to client successfully (offline mode)'
      };
    }
  }

  // Get leads statistics
  async getLeadsStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.agentId) queryParams.append('agentId', params.agentId);

      const url = `${this.baseURL}${API_ENDPOINTS.LEADS_STATS}?${queryParams}`;
      const response = await this.fetchWithRetry(url);
      
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch leads stats from API, using mock data:', error.message);
      
      // Mock statistics for offline mode
      return {
        totalLeads: sampleLeads.length,
        newLeads: sampleLeads.filter(l => l.status === 'New').length,
        inProgress: sampleLeads.filter(l => l.status === 'In Progress').length,
        qualified: sampleLeads.filter(l => l.status === 'Qualified').length,
        closed: sampleLeads.filter(l => l.status === 'Closed').length,
        conversionRate: 25.5,
        averageResponseTime: '2.3 hours',
        topSources: [
          { source: 'Website', count: 2 },
          { source: 'Referral', count: 1 },
          { source: 'Cold Call', count: 1 },
          { source: 'Social Media', count: 1 }
        ]
      };
    }
  }
}

// Export singleton instance
export const leadsApi = new LeadsAPI();
export default leadsApi;
