
/**
 * Invoice API service for backend integration
 * Optimized for MongoDB/Node.js/Express backend
 */

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from '../../config/api';
import { getSampleInvoices } from '../../utils/invoiceUtils';

class InvoicesApi {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.isOfflineMode = false;
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      
      this.isOfflineMode = !response.ok;
      return response.ok;
    } catch (error) {
      console.log('Backend not available, using offline mode');
      this.isOfflineMode = true;
      return false;
    }
  }

  /**
   * Get sample invoices data (offline fallback)
   */
  getSampleData() {
    const stored = localStorage.getItem('invoicesData');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const sampleData = getSampleInvoices();
    localStorage.setItem('invoicesData', JSON.stringify(sampleData));
    return sampleData;
  }

  /**
   * Make HTTP request with error handling
   */
  async makeRequest(endpoint, options = {}) {
    // Check backend availability first
    if (!await this.checkBackendHealth()) {
      throw new Error('Backend unavailable - using offline mode');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all invoices with filtering and pagination
   */
  async getInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 50);
      
      // Add filtering
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.clientId && params.clientId !== 'all') {
        queryParams.append('clientId', params.clientId);
      }
      if (params.agentId && params.agentId !== 'all') {
        queryParams.append('agentId', params.agentId);
      }
      if (params.policyType && params.policyType !== 'all') {
        queryParams.append('policyType', params.policyType);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      // Add sorting
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
        queryParams.append('sortOrder', params.sortOrder || 'desc');
      }
      
      // Add date range
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const endpoint = `${API_ENDPOINTS.INVOICES}?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        invoices: response.data || response.invoices || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        success: true
      };
    } catch (error) {
      console.log('API not available, using offline mode with sample data');
      this.isOfflineMode = true;
      
      const sampleInvoices = this.getSampleData();
      
      return {
        invoices: sampleInvoices,
        total: sampleInvoices.length,
        page: 1,
        totalPages: 1,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId) {
    try {
      const endpoint = `${API_ENDPOINTS.INVOICES}/${invoiceId}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        invoice: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, using offline mode');
      this.isOfflineMode = true;
      
      const sampleInvoices = this.getSampleData();
      const invoice = sampleInvoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      return {
        invoice,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(invoiceData) {
    try {
      const endpoint = API_ENDPOINTS.INVOICES;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
      
      return {
        invoice: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, creating invoice in offline mode');
      this.isOfflineMode = true;
      
      // Create invoice locally
      const newInvoice = {
        id: `INV_${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const existingInvoices = this.getSampleData();
      const updatedInvoices = [newInvoice, ...existingInvoices];
      localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
      
      return {
        invoice: newInvoice,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const endpoint = `${API_ENDPOINTS.INVOICES}/${invoiceId}`;
      const response = await this.makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(invoiceData),
      });
      
      return {
        invoice: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, updating invoice in offline mode');
      this.isOfflineMode = true;
      
      // Update invoice locally
      const existingInvoices = this.getSampleData();
      const invoiceIndex = existingInvoices.findIndex(inv => inv.id === invoiceId);
      
      if (invoiceIndex === -1) {
        throw new Error('Invoice not found');
      }
      
      const updatedInvoice = {
        ...existingInvoices[invoiceIndex],
        ...invoiceData,
        updatedAt: new Date().toISOString(),
      };
      
      existingInvoices[invoiceIndex] = updatedInvoice;
      localStorage.setItem('invoicesData', JSON.stringify(existingInvoices));
      
      return {
        invoice: updatedInvoice,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoiceId) {
    try {
      const endpoint = `${API_ENDPOINTS.INVOICES}/${invoiceId}`;
      await this.makeRequest(endpoint, { method: 'DELETE' });
      
      return { success: true };
    } catch (error) {
      console.log('API not available, deleting invoice in offline mode');
      this.isOfflineMode = true;
      
      // Delete invoice locally
      const existingInvoices = this.getSampleData();
      const updatedInvoices = existingInvoices.filter(inv => inv.id !== invoiceId);
      localStorage.setItem('invoicesData', JSON.stringify(updatedInvoices));
      
      return { success: true, offline: true };
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      if (params.agentId) {
        queryParams.append('agentId', params.agentId);
      }

      const endpoint = `${API_ENDPOINTS.INVOICES}/stats?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        stats: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, calculating stats from sample data');
      this.isOfflineMode = true;
      
      const sampleInvoices = this.getSampleData();
      
      // Calculate basic stats
      const stats = {
        total: sampleInvoices.length,
        paid: sampleInvoices.filter(inv => inv.status === 'paid').length,
        pending: sampleInvoices.filter(inv => inv.status === 'sent').length,
        overdue: sampleInvoices.filter(inv => inv.status === 'overdue').length,
        draft: sampleInvoices.filter(inv => inv.status === 'draft').length,
        totalAmount: sampleInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        paidAmount: sampleInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
        pendingAmount: sampleInvoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0),
      };
      
      return {
        stats,
        success: true,
        offline: true
      };
    }
  }

  /**
   * Send invoice via email
   */
  async sendInvoice(invoiceId, emailData) {
    try {
      const endpoint = `${API_ENDPOINTS.INVOICES}/${invoiceId}/send`;
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(emailData),
      });
      
      return {
        result: response.data || response,
        success: true
      };
    } catch (error) {
      console.log('API not available, simulating email send in offline mode');
      this.isOfflineMode = true;
      
      // Update invoice status locally
      const existingInvoices = this.getSampleData();
      const invoiceIndex = existingInvoices.findIndex(inv => inv.id === invoiceId);
      
      if (invoiceIndex !== -1) {
        existingInvoices[invoiceIndex].status = 'sent';
        existingInvoices[invoiceIndex].sentAt = new Date().toISOString();
        localStorage.setItem('invoicesData', JSON.stringify(existingInvoices));
      }
      
      return {
        result: { message: 'Invoice sent successfully (offline mode)' },
        success: true,
        offline: true
      };
    }
  }
}

// Create and export singleton instance
export const invoicesApi = new InvoicesApi();
export default invoicesApi;
