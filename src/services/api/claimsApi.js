
import MongoDBApiService from './mongodbApiService.js';
import { API_ENDPOINTS } from '../../config/api.js';

/**
 * Claims API Service with MongoDB Integration
 */
class ClaimsApiService extends MongoDBApiService {
  constructor() {
    super(API_ENDPOINTS.CLAIMS);
  }

  async getClaims(params = {}) {
    return this.getAll(params);
  }

  async getClaimById(claimId) {
    return this.getById(claimId);
  }

  async createClaim(claimData) {
    return this.create(claimData);
  }

  async updateClaim(claimId, claimData) {
    return this.update(claimId, claimData);
  }

  async deleteClaim(claimId) {
    return this.delete(claimId);
  }

  async updateClaimStatus(claimId, status, reason) {
    return this.makeRequest(`/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason })
    });
  }

  async approveClaim(claimId, approvalData) {
    return this.makeRequest(`/${claimId}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    });
  }

  async rejectClaim(claimId, rejectionData) {
    return this.makeRequest(`/${claimId}/reject`, {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    });
  }

  async getClaimDocuments(claimId) {
    return this.makeRequest(`/${claimId}/documents`);
  }

  async uploadClaimDocument(claimId, documentData) {
    return this.makeRequest(`/${claimId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  }

  async getClaimsStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/stats?${queryString}` : '/stats';
    return this.makeRequest(endpoint);
  }
}

export const claimsApi = new ClaimsApiService();
export default claimsApi;
