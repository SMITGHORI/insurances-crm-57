
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api';

/**
 * Quotations API Service
 * Handles all quotations-related API calls with offline fallback
 * Optimized for MongoDB/Node.js/Express backend integration
 */

class QuotationsApi {
  constructor() {
    this.isOfflineMode = false;
    this.checkOnlineStatus();
  }

  async checkOnlineStatus() {
    try {
      const response = await fetch(API_CONFIG.BASE_URL + '/health', {
        method: 'GET',
        timeout: 5000,
      });
      this.isOfflineMode = !response.ok;
    } catch (error) {
      this.isOfflineMode = true;
      console.log('API not available, using offline mode with sample data');
    }
  }

  // Sample data for offline mode (matches MongoDB document structure)
  getSampleQuotations() {
    return {
      quotations: [
        {
          _id: '674a1234567890abcdef0001',
          quoteId: 'QT-2025-0001',
          clientId: '674a1234567890abcdef0101',
          clientName: 'Vivek Patel',
          insuranceType: 'Health Insurance',
          insuranceCompany: 'Star Health',
          products: ['Family Floater Plan', 'Critical Illness Add-on'],
          sumInsured: 500000,
          premium: 25000,
          agentId: '674a1234567890abcdef0201',
          agentName: 'Rajiv Kumar',
          status: 'draft',
          emailSent: false,
          sentDate: null,
          viewedAt: null,
          acceptedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          convertedToPolicy: null,
          validUntil: new Date('2025-06-18'),
          notes: 'Client requested quotes for family of 4 with pre-existing conditions',
          createdAt: new Date('2025-05-18'),
          updatedAt: new Date('2025-05-18'),
          createdBy: '674a1234567890abcdef0201',
          updatedBy: '674a1234567890abcdef0201'
        },
        {
          _id: '674a1234567890abcdef0002',
          quoteId: 'QT-2025-0002',
          clientId: '674a1234567890abcdef0102',
          clientName: 'Priya Desai',
          insuranceType: 'Term Insurance',
          insuranceCompany: 'HDFC Life',
          products: ['Click 2 Protect Life', 'Critical Illness Rider'],
          sumInsured: 10000000,
          premium: 15000,
          agentId: '674a1234567890abcdef0204',
          agentName: 'Neha Sharma',
          status: 'sent',
          emailSent: true,
          sentDate: new Date('2025-05-15'),
          viewedAt: null,
          acceptedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          convertedToPolicy: null,
          validUntil: new Date('2025-06-15'),
          notes: 'Client is a non-smoker with no medical history',
          createdAt: new Date('2025-05-15'),
          updatedAt: new Date('2025-05-15'),
          createdBy: '674a1234567890abcdef0204',
          updatedBy: '674a1234567890abcdef0204'
        },
        {
          _id: '674a1234567890abcdef0003',
          quoteId: 'QT-2025-0003',
          clientId: '674a1234567890abcdef0103',
          clientName: 'Tech Solutions Ltd',
          insuranceType: 'Group Health Insurance',
          insuranceCompany: 'ICICI Lombard',
          products: ['Group Mediclaim Policy'],
          sumInsured: 2000000,
          premium: 450000,
          agentId: '674a1234567890abcdef0201',
          agentName: 'Rajiv Kumar',
          status: 'viewed',
          emailSent: true,
          sentDate: new Date('2025-05-12'),
          viewedAt: new Date('2025-05-14'),
          acceptedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          convertedToPolicy: null,
          validUntil: new Date('2025-06-12'),
          notes: 'Company has 50 employees, looking for comprehensive coverage',
          createdAt: new Date('2025-05-12'),
          updatedAt: new Date('2025-05-14'),
          createdBy: '674a1234567890abcdef0201',
          updatedBy: '674a1234567890abcdef0201'
        },
        {
          _id: '674a1234567890abcdef0004',
          quoteId: 'QT-2025-0004',
          clientId: '674a1234567890abcdef0104',
          clientName: 'Arjun Singh',
          insuranceType: 'Motor Insurance',
          insuranceCompany: 'Bajaj Allianz',
          products: ['Comprehensive Car Insurance'],
          sumInsured: 800000,
          premium: 12000,
          agentId: '674a1234567890abcdef0203',
          agentName: 'Amir Khan',
          status: 'accepted',
          emailSent: true,
          sentDate: new Date('2025-05-10'),
          viewedAt: new Date('2025-05-11'),
          acceptedAt: new Date('2025-05-12'),
          rejectedAt: null,
          rejectionReason: null,
          convertedToPolicy: 'POL-2025-0412',
          validUntil: new Date('2025-06-10'),
          notes: 'New car purchase, comprehensive coverage with zero-dep add-on',
          createdAt: new Date('2025-05-10'),
          updatedAt: new Date('2025-05-12'),
          createdBy: '674a1234567890abcdef0203',
          updatedBy: '674a1234567890abcdef0203'
        },
        {
          _id: '674a1234567890abcdef0005',
          quoteId: 'QT-2025-0005',
          clientId: '674a1234567890abcdef0105',
          clientName: 'Ramesh Joshi',
          insuranceType: 'Health Insurance',
          insuranceCompany: 'Max Bupa',
          products: ['Health Companion'],
          sumInsured: 700000,
          premium: 32000,
          agentId: '674a1234567890abcdef0202',
          agentName: 'Priya Singh',
          status: 'rejected',
          emailSent: true,
          sentDate: new Date('2025-05-08'),
          viewedAt: new Date('2025-05-09'),
          acceptedAt: null,
          rejectedAt: new Date('2025-05-10'),
          rejectionReason: 'Premium too high',
          convertedToPolicy: null,
          validUntil: new Date('2025-06-08'),
          notes: 'Client has pre-existing conditions, diabetes and hypertension',
          createdAt: new Date('2025-05-08'),
          updatedAt: new Date('2025-05-10'),
          createdBy: '674a1234567890abcdef0202',
          updatedBy: '674a1234567890abcdef0202'
        },
        {
          _id: '674a1234567890abcdef0006',
          quoteId: 'QT-2025-0006',
          clientId: '674a1234567890abcdef0106',
          clientName: 'Sanjay Mehta',
          insuranceType: 'Travel Insurance',
          insuranceCompany: 'Tata AIG',
          products: ['Travel Guard'],
          sumInsured: 500000,
          premium: 5000,
          agentId: '674a1234567890abcdef0204',
          agentName: 'Neha Sharma',
          status: 'expired',
          emailSent: true,
          sentDate: new Date('2025-05-01'),
          viewedAt: new Date('2025-05-02'),
          acceptedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          convertedToPolicy: null,
          validUntil: new Date('2025-06-01'),
          notes: 'Client traveling to USA for 2 weeks',
          createdAt: new Date('2025-05-01'),
          updatedAt: new Date('2025-05-02'),
          createdBy: '674a1234567890abcdef0204',
          updatedBy: '674a1234567890abcdef0204'
        }
      ],
      total: 6,
      page: 1,
      limit: 50,
      totalPages: 1
    };
  }

  // Convert MongoDB date objects to display format for UI compatibility
  formatQuotationForUI(quotation) {
    return {
      ...quotation,
      id: quotation._id,
      createdDate: quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : '',
      validUntil: quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : '',
      sentDate: quotation.sentDate ? new Date(quotation.sentDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : null
    };
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get quotations with filtering and pagination
  async getQuotations(params = {}) {
    if (this.isOfflineMode) {
      console.log('Using offline mode for quotations');
      const sampleData = this.getSampleQuotations();
      
      // Format quotations for UI
      const formattedQuotations = sampleData.quotations.map(q => this.formatQuotationForUI(q));
      
      return {
        ...sampleData,
        quotations: formattedQuotations
      };
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filtering
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.insuranceType && params.insuranceType !== 'all') queryParams.append('insuranceType', params.insuranceType);
      if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);
      if (params.search) queryParams.append('search', params.search);
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `${API_ENDPOINTS.QUOTATIONS}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      // Format quotations for UI
      if (response.quotations) {
        response.quotations = response.quotations.map(q => this.formatQuotationForUI(q));
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      this.isOfflineMode = true;
      return this.getQuotations(params);
    }
  }

  // Get quotation by ID
  async getQuotationById(quotationId) {
    if (this.isOfflineMode) {
      const sampleData = this.getSampleQuotations();
      const quotation = sampleData.quotations.find(q => q._id === quotationId || q.quoteId === quotationId);
      
      if (!quotation) {
        throw new Error('Quotation not found');
      }
      
      return this.formatQuotationForUI(quotation);
    }

    try {
      const response = await this.makeRequest(API_ENDPOINTS.QUOTATION_BY_ID(quotationId));
      return this.formatQuotationForUI(response);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      this.isOfflineMode = true;
      return this.getQuotationById(quotationId);
    }
  }

  // Create new quotation
  async createQuotation(quotationData) {
    const formattedData = {
      ...quotationData,
      status: quotationData.status || 'draft',
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.isOfflineMode) {
      console.log('Creating quotation in offline mode:', formattedData);
      
      // Simulate MongoDB document creation
      const newQuotation = {
        _id: `674a${Date.now()}abcdef`,
        quoteId: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
        ...formattedData
      };
      
      return this.formatQuotationForUI(newQuotation);
    }

    try {
      const response = await this.makeRequest(API_ENDPOINTS.QUOTATIONS, {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
      
      return this.formatQuotationForUI(response);
    } catch (error) {
      console.error('Error creating quotation:', error);
      this.isOfflineMode = true;
      return this.createQuotation(quotationData);
    }
  }

  // Update quotation
  async updateQuotation(quotationId, quotationData) {
    const formattedData = {
      ...quotationData,
      updatedAt: new Date()
    };

    if (this.isOfflineMode) {
      console.log('Updating quotation in offline mode:', quotationId, formattedData);
      
      const sampleData = this.getSampleQuotations();
      const quotation = sampleData.quotations.find(q => q._id === quotationId || q.quoteId === quotationId);
      
      if (!quotation) {
        throw new Error('Quotation not found');
      }
      
      const updatedQuotation = { ...quotation, ...formattedData };
      return this.formatQuotationForUI(updatedQuotation);
    }

    try {
      const response = await this.makeRequest(API_ENDPOINTS.QUOTATION_BY_ID(quotationId), {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      });
      
      return this.formatQuotationForUI(response);
    } catch (error) {
      console.error('Error updating quotation:', error);
      this.isOfflineMode = true;
      return this.updateQuotation(quotationId, quotationData);
    }
  }

  // Delete quotation
  async deleteQuotation(quotationId) {
    if (this.isOfflineMode) {
      console.log('Deleting quotation in offline mode:', quotationId);
      return { success: true, message: 'Quotation deleted successfully (offline mode)' };
    }

    try {
      const response = await this.makeRequest(API_ENDPOINTS.QUOTATION_BY_ID(quotationId), {
        method: 'DELETE',
      });
      
      return response;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      this.isOfflineMode = true;
      return this.deleteQuotation(quotationId);
    }
  }

  // Send quotation via email
  async sendQuotation(quotationId, emailData = {}) {
    const updateData = {
      status: 'sent',
      emailSent: true,
      sentDate: new Date(),
      ...emailData
    };

    if (this.isOfflineMode) {
      console.log('Sending quotation in offline mode:', quotationId, updateData);
      return this.updateQuotation(quotationId, updateData);
    }

    try {
      const response = await this.makeRequest(API_ENDPOINTS.QUOTATION_SEND(quotationId), {
        method: 'POST',
        body: JSON.stringify(emailData),
      });
      
      return this.formatQuotationForUI(response);
    } catch (error) {
      console.error('Error sending quotation:', error);
      this.isOfflineMode = true;
      return this.updateQuotation(quotationId, updateData);
    }
  }

  // Update quotation status
  async updateQuotationStatus(quotationId, status, additionalData = {}) {
    const updateData = {
      status,
      ...additionalData
    };

    // Add status-specific timestamps
    if (status === 'viewed') {
      updateData.viewedAt = new Date();
    } else if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    return this.updateQuotation(quotationId, updateData);
  }

  // Get quotations statistics
  async getQuotationsStats(params = {}) {
    if (this.isOfflineMode) {
      return {
        totalQuotations: 6,
        draftQuotations: 1,
        sentQuotations: 1,
        viewedQuotations: 1,
        acceptedQuotations: 1,
        rejectedQuotations: 1,
        expiredQuotations: 1,
        totalPremium: 539000,
        averagePremium: 89833,
        conversionRate: 16.67
      };
    }

    try {
      const queryParams = new URLSearchParams(params);
      const endpoint = `${API_ENDPOINTS.QUOTATIONS_STATS}?${queryParams.toString()}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching quotations stats:', error);
      this.isOfflineMode = true;
      return this.getQuotationsStats(params);
    }
  }
}

// Export singleton instance
export const quotationsApi = new QuotationsApi();
export default quotationsApi;
