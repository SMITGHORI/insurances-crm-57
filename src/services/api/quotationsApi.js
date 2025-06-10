
import { quotationsBackendApi } from './quotationsApiBackend';

// Sample/Mock data for offline mode
const sampleQuotations = [
  {
    id: '674a1234567890abcdef0001',
    quoteId: 'QT-2025-0001',
    clientId: '674a1234567890abcdef1001',
    clientName: 'John Doe',
    insuranceType: 'Health Insurance',
    insuranceCompany: 'Star Health',
    products: [
      {
        name: 'Family Floater Plan',
        description: 'Comprehensive health coverage for family',
        sumInsured: 500000,
        premium: 25000
      }
    ],
    sumInsured: 500000,
    premium: 25000,
    agentId: '674a1234567890abcdef2001',
    agentName: 'Agent Smith',
    status: 'draft',
    validUntil: '2025-07-01',
    createdDate: '2025-06-01',
    notes: 'Initial quotation for family health insurance'
  },
  {
    id: '674a1234567890abcdef0002',
    quoteId: 'QT-2025-0002',
    clientId: '674a1234567890abcdef1002',
    clientName: 'Jane Smith',
    insuranceType: 'Motor Insurance',
    insuranceCompany: 'ICICI Lombard',
    products: [
      {
        name: 'Comprehensive Motor Plan',
        description: 'Full coverage for vehicle',
        sumInsured: 800000,
        premium: 15000
      }
    ],
    sumInsured: 800000,
    premium: 15000,
    agentId: '674a1234567890abcdef2001',
    agentName: 'Agent Smith',
    status: 'sent',
    validUntil: '2025-06-30',
    createdDate: '2025-05-15',
    notes: 'Motor insurance for new vehicle'
  },
  {
    id: '674a1234567890abcdef0003',
    quoteId: 'QT-2025-0003',
    clientId: '674a1234567890abcdef1003',
    clientName: 'Mike Johnson',
    insuranceType: 'Life Insurance',
    insuranceCompany: 'HDFC Life',
    products: [
      {
        name: 'Term Life Plan',
        description: 'Term life insurance coverage',
        sumInsured: 1000000,
        premium: 12000
      }
    ],
    sumInsured: 1000000,
    premium: 12000,
    agentId: '674a1234567890abcdef2002',
    agentName: 'Agent Jones',
    status: 'accepted',
    validUntil: '2025-08-01',
    createdDate: '2025-05-01',
    notes: 'Term life insurance accepted by client'
  }
];

/**
 * Quotations API service with backend integration and offline fallback
 */
class QuotationsApiService {
  constructor() {
    this.isOfflineMode = false;
    this.backendApi = quotationsBackendApi;
  }

  /**
   * Check if we should use offline mode
   */
  async checkConnection() {
    try {
      // Try to make a simple request to check backend connectivity
      await fetch('/api/health');
      this.isOfflineMode = false;
    } catch (error) {
      console.warn('Backend not available, using offline mode');
      this.isOfflineMode = true;
    }
  }

  /**
   * Get all quotations with filtering and pagination
   */
  async getQuotations(params = {}) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.getQuotations(params);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - use sample data
    console.log('Using offline mode for quotations');
    let filteredQuotations = [...sampleQuotations];

    // Apply client-side filtering for offline mode
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredQuotations = filteredQuotations.filter(quote =>
        quote.quoteId.toLowerCase().includes(searchTerm) ||
        quote.clientName.toLowerCase().includes(searchTerm) ||
        quote.insuranceCompany.toLowerCase().includes(searchTerm)
      );
    }

    if (params.status && params.status !== 'all') {
      filteredQuotations = filteredQuotations.filter(quote => quote.status === params.status);
    }

    if (params.insuranceType && params.insuranceType !== 'all') {
      filteredQuotations = filteredQuotations.filter(quote => 
        quote.insuranceType.toLowerCase().includes(params.insuranceType.toLowerCase())
      );
    }

    return {
      quotations: filteredQuotations,
      totalCount: filteredQuotations.length,
      success: true
    };
  }

  /**
   * Get a single quotation by ID
   */
  async getQuotationById(id) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.getQuotationById(id);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode
    const quotation = sampleQuotations.find(q => q.id === id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    return quotation;
  }

  /**
   * Create a new quotation
   */
  async createQuotation(quotationData) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.createQuotation(quotationData);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - simulate creation
    const newQuotation = {
      id: `674a1234567890abcdef000${sampleQuotations.length + 1}`,
      quoteId: `QT-2025-${String(sampleQuotations.length + 1).padStart(4, '0')}`,
      ...quotationData,
      createdDate: new Date().toISOString().split('T')[0],
      status: quotationData.status || 'draft'
    };

    sampleQuotations.push(newQuotation);
    return newQuotation;
  }

  /**
   * Update an existing quotation
   */
  async updateQuotation(id, quotationData) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.updateQuotation(id, quotationData);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - simulate update
    const index = sampleQuotations.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quotation not found');
    }

    sampleQuotations[index] = {
      ...sampleQuotations[index],
      ...quotationData,
      updatedAt: new Date().toISOString()
    };

    return sampleQuotations[index];
  }

  /**
   * Delete a quotation
   */
  async deleteQuotation(id) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.deleteQuotation(id);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - simulate deletion
    const index = sampleQuotations.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quotation not found');
    }

    sampleQuotations.splice(index, 1);
    return { success: true };
  }

  /**
   * Send quotation via email
   */
  async sendQuotation(quotationId, emailData = {}) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.sendQuotation(quotationId, emailData);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - simulate sending
    const quotation = await this.getQuotationById(quotationId);
    quotation.status = 'sent';
    quotation.sentDate = new Date().toISOString();
    return quotation;
  }

  /**
   * Update quotation status
   */
  async updateQuotationStatus(quotationId, status, additionalData = {}) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.updateQuotationStatus(quotationId, status, additionalData);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - simulate status update
    const quotation = await this.getQuotationById(quotationId);
    quotation.status = status;
    
    if (status === 'accepted') {
      quotation.acceptedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      quotation.rejectedAt = new Date().toISOString();
      quotation.rejectionReason = additionalData.rejectionReason;
    }
    
    return quotation;
  }

  /**
   * Get quotations statistics
   */
  async getQuotationsStats(params = {}) {
    try {
      if (!this.isOfflineMode) {
        return await this.backendApi.getQuotationsStats(params);
      }
    } catch (error) {
      console.error('Backend request failed, falling back to offline mode:', error);
      this.isOfflineMode = true;
    }

    // Offline mode - calculate stats from sample data
    const totalQuotations = sampleQuotations.length;
    const statusStats = sampleQuotations.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {});

    const totalPremium = sampleQuotations.reduce((sum, quote) => sum + quote.premium, 0);
    const averagePremium = totalQuotations > 0 ? totalPremium / totalQuotations : 0;

    return {
      totalQuotations,
      statusBreakdown: {
        draft: statusStats.draft || 0,
        sent: statusStats.sent || 0,
        viewed: statusStats.viewed || 0,
        accepted: statusStats.accepted || 0,
        rejected: statusStats.rejected || 0,
        expired: statusStats.expired || 0
      },
      premiumStats: {
        totalPremium,
        averagePremium,
        minPremium: Math.min(...sampleQuotations.map(q => q.premium)),
        maxPremium: Math.max(...sampleQuotations.map(q => q.premium))
      },
      conversionRate: 0,
      period: params.period || 30
    };
  }
}

// Export singleton instance
export const quotationsApi = new QuotationsApiService();
export default quotationsApi;
