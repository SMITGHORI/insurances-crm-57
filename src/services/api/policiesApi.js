
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Policies API Service with MongoDB Integration
 */
class PoliciesApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.POLICIES);
  }

  async getPolicies(params = {}) {
    return this.getAll(params);
  }

  async getPolicyById(policyId) {
    return this.getById(policyId);
  }

  async createPolicy(policyData) {
    return this.create(policyData);
  }

  async updatePolicy(policyId, policyData) {
    return this.update(policyId, policyData);
  }

  async deletePolicy(policyId) {
    return this.delete(policyId);
  }

  async renewPolicy(policyId, renewalData) {
    return this.makeRequest(`/${policyId}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData)
    });
  }

  async cancelPolicy(policyId, cancellationData) {
    return this.makeRequest(`/${policyId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(cancellationData)
    });
  }

  async getPolicyDocuments(policyId) {
    return this.makeRequest(`/${policyId}/documents`);
  }

  async uploadPolicyDocument(policyId, documentData) {
    return this.makeRequest(`/${policyId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  }

  async getExpiringPolicies(days = 30) {
    return this.makeRequest(`/expiring?days=${days}`);
  }
}

export const policiesApi = new PoliciesApiService();
export default policiesApi;
