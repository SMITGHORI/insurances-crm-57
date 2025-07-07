
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Quotations API Service with MongoDB Integration
 */
class QuotationsApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.QUOTATIONS);
  }

  async getQuotations(params = {}) {
    return this.getAll(params);
  }

  async getQuotationById(quotationId) {
    return this.getById(quotationId);
  }

  async createQuotation(quotationData) {
    return this.create(quotationData);
  }

  async updateQuotation(quotationId, quotationData) {
    return this.update(quotationId, quotationData);
  }

  async deleteQuotation(quotationId) {
    return this.delete(quotationId);
  }

  async sendQuotation(quotationId, emailData) {
    return this.makeRequest(`/${quotationId}/send`, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  async updateQuotationStatus(quotationId, status, additionalData = {}) {
    return this.makeRequest(`/${quotationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...additionalData })
    });
  }

  async convertToPolicy(quotationId, policyData) {
    return this.makeRequest(`/${quotationId}/convert`, {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async getQuotationsStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    return this.makeRequest(endpoint);
  }
}

export const quotationsApi = new QuotationsApiService();
export default quotationsApi;
