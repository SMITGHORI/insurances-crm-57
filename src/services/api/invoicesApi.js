
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Invoices API Service with MongoDB Integration
 */
class InvoicesApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.INVOICES);
  }

  async getInvoices(params = {}) {
    return this.getAll(params);
  }

  async getInvoiceById(invoiceId) {
    return this.getById(invoiceId);
  }

  async createInvoice(invoiceData) {
    return this.create(invoiceData);
  }

  async updateInvoice(invoiceId, invoiceData) {
    return this.update(invoiceId, invoiceData);
  }

  async deleteInvoice(invoiceId) {
    return this.delete(invoiceId);
  }

  async sendInvoice(invoiceId, emailData) {
    return this.makeRequest(`/${invoiceId}/send`, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  async markInvoiceAsPaid(invoiceId, paymentData) {
    return this.makeRequest(`/${invoiceId}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getInvoiceStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    return this.makeRequest(endpoint);
  }

  async getOverdueInvoices() {
    return this.makeRequest('/overdue');
  }
}

export const invoicesApi = new InvoicesApiService();
export default invoicesApi;
