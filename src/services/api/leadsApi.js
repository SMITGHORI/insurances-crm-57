
import { toast } from 'sonner';

/**
 * Leads API service with offline mode support
 * Falls back to sample data when backend is unavailable
 */
class LeadsApiService {
  constructor() {
    this.baseURL = '/api/leads';
    this.isOfflineMode = true; // Start in offline mode for demo
  }

  // Sample leads data
  getSampleLeads() {
    return [
      {
        id: 'LD001',
        leadId: 'LD001',
        name: 'Arun Sharma',
        phone: '9876543210',
        email: 'arun.sharma@example.com',
        address: '123 Main Street, Mumbai, Maharashtra',
        source: 'Website',
        product: 'Health Insurance',
        status: 'In Progress',
        budget: 500000,
        createdAt: '2025-04-10',
        assignedTo: 'Raj Malhotra',
        nextFollowUp: '2025-05-22',
        lastInteraction: '2025-05-15',
        priority: 'High',
        additionalInfo: 'Looking for family health insurance plan for 4 members',
        followUps: [],
        notes: []
      },
      {
        id: 'LD002',
        leadId: 'LD002',
        name: 'Priya Patel',
        phone: '9876543211',
        email: 'priya.patel@example.com',
        address: '456 Oak Street, Delhi',
        source: 'Referral',
        product: 'Motor Insurance',
        status: 'New',
        budget: 75000,
        createdAt: '2025-04-15',
        assignedTo: 'Amit Kumar',
        nextFollowUp: '2025-05-25',
        lastInteraction: '2025-05-20',
        priority: 'Medium',
        additionalInfo: 'Interested in comprehensive car insurance',
        followUps: [],
        notes: []
      },
      {
        id: 'LD003',
        leadId: 'LD003',
        name: 'Rahul Singh',
        phone: '9876543212',
        email: 'rahul.singh@example.com',
        address: '789 Pine Street, Bangalore',
        source: 'Cold Call',
        product: 'Life Insurance',
        status: 'Qualified',
        budget: 1000000,
        createdAt: '2025-04-20',
        assignedTo: 'Sunita Verma',
        nextFollowUp: '2025-05-28',
        lastInteraction: '2025-05-22',
        priority: 'High',
        additionalInfo: 'Looking for term life insurance for 20 years',
        followUps: [],
        notes: []
      },
      {
        id: 'LD004',
        leadId: 'LD004',
        name: 'Meera Joshi',
        phone: '9876543213',
        email: 'meera.joshi@example.com',
        address: '321 Elm Street, Pune',
        source: 'Social Media',
        product: 'Travel Insurance',
        status: 'Not Interested',
        budget: 25000,
        createdAt: '2025-04-25',
        assignedTo: 'Vikash Sharma',
        nextFollowUp: null,
        lastInteraction: '2025-05-18',
        priority: 'Low',
        additionalInfo: 'Was interested but found cheaper alternative',
        followUps: [],
        notes: []
      },
      {
        id: 'LD005',
        leadId: 'LD005',
        name: 'Deepak Gupta',
        phone: '9876543214',
        email: 'deepak.gupta@example.com',
        address: '654 Maple Street, Chennai',
        source: 'Event',
        product: 'Home Insurance',
        status: 'Converted',
        budget: 150000,
        createdAt: '2025-03-30',
        assignedTo: 'Raj Malhotra',
        nextFollowUp: null,
        lastInteraction: '2025-05-10',
        priority: 'Medium',
        additionalInfo: 'Successfully converted to client',
        followUps: [],
        notes: []
      }
    ];
  }

  /**
   * Generic API request handler with fallback to sample data
   */
  async request(endpoint, options = {}) {
    if (this.isOfflineMode) {
      // Return sample data immediately
      return this.handleOfflineRequest(endpoint, options);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.warn('Failed to fetch leads from API, using sample data:', error.message);
      this.isOfflineMode = true;
      return this.handleOfflineRequest(endpoint, options);
    }
  }

  /**
   * Handle requests in offline mode with sample data
   */
  handleOfflineRequest(endpoint, options) {
    const sampleLeads = this.getSampleLeads();
    
    if (options.method === 'POST') {
      // Mock create lead
      const newLead = {
        id: `LD${String(sampleLeads.length + 1).padStart(3, '0')}`,
        leadId: `LD${String(sampleLeads.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'New',
        priority: 'Medium',
        followUps: [],
        notes: [],
        ...JSON.parse(options.body || '{}')
      };
      return Promise.resolve(newLead);
    }

    if (options.method === 'PUT') {
      // Mock update lead
      const leadId = endpoint.split('/')[1];
      const existingLead = sampleLeads.find(lead => lead.id === leadId);
      if (existingLead) {
        const updatedLead = { ...existingLead, ...JSON.parse(options.body || '{}') };
        return Promise.resolve(updatedLead);
      }
    }

    if (options.method === 'DELETE') {
      // Mock delete lead
      return Promise.resolve({ success: true });
    }

    if (endpoint.includes('/stats')) {
      // Mock stats
      return Promise.resolve({
        totalLeads: sampleLeads.length,
        newLeads: sampleLeads.filter(l => l.status === 'New').length,
        inProgress: sampleLeads.filter(l => l.status === 'In Progress').length,
        qualified: sampleLeads.filter(l => l.status === 'Qualified').length,
        converted: sampleLeads.filter(l => l.status === 'Converted').length,
        lost: sampleLeads.filter(l => l.status === 'Lost' || l.status === 'Not Interested').length,
        conversionRate: '20.0'
      });
    }

    // Default: return leads list
    return Promise.resolve({
      leads: sampleLeads,
      totalCount: sampleLeads.length,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: sampleLeads.length,
        itemsPerPage: 50,
        hasNext: false,
        hasPrev: false
      },
      success: true
    });
  }

  /**
   * Get all leads with filtering and pagination
   */
  async getLeads(params = {}) {
    console.log('Fetching leads with params:', params);
    return this.request('', { method: 'GET' });
  }

  /**
   * Get a single lead by ID
   */
  async getLeadById(id) {
    if (this.isOfflineMode) {
      const sampleLeads = this.getSampleLeads();
      const lead = sampleLeads.find(lead => lead.id === id || lead.leadId === id);
      if (lead) {
        return Promise.resolve(lead);
      }
      throw new Error('Lead not found');
    }
    return this.request(`/${id}`);
  }

  /**
   * Create a new lead
   */
  async createLead(leadData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  /**
   * Update an existing lead
   */
  async updateLead(id, leadData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  /**
   * Delete a lead
   */
  async deleteLead(id) {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add follow-up to lead
   */
  async addFollowUp(leadId, followUpData) {
    return this.request(`/${leadId}/followups`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
  }

  /**
   * Add note to lead
   */
  async addNote(leadId, noteData) {
    return this.request(`/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  /**
   * Assign lead to agent
   */
  async assignLead(leadId, assignmentData) {
    return this.request(`/${leadId}/assign`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Convert lead to client
   */
  async convertToClient(leadId) {
    return this.request(`/${leadId}/convert`, {
      method: 'POST',
    });
  }

  /**
   * Get leads statistics
   */
  async getLeadsStats(params = {}) {
    return this.request('/stats');
  }

  /**
   * Search leads
   */
  async searchLeads(query, limit = 10) {
    if (this.isOfflineMode) {
      const sampleLeads = this.getSampleLeads();
      const searchResults = sampleLeads.filter(lead => 
        lead.name.toLowerCase().includes(query.toLowerCase()) ||
        lead.email.toLowerCase().includes(query.toLowerCase()) ||
        lead.phone.includes(query) ||
        lead.leadId.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      return Promise.resolve(searchResults);
    }
    return this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
  }
}

// Export singleton instance
export const leadsApi = new LeadsApiService();
export default leadsApi;
