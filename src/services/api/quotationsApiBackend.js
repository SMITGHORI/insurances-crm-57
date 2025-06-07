
import { API_CONFIG, API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

/**
 * Backend API service for quotations operations
 * Connects to Node.js + Express + MongoDB backend
 */
class QuotationsBackendApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.QUOTATIONS}`;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint, options = {}) {
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
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all quotations with filtering and pagination
   */
  async getQuotations(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.insuranceType && params.insuranceType !== 'all') queryParams.append('insuranceType', params.insuranceType);
    if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);
    if (params.clientId && params.clientId !== 'all') queryParams.append('clientId', params.clientId);
    
    // Add sorting parameters
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Add date range parameters
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.validFrom) queryParams.append('validFrom', params.validFrom);
    if (params.validTo) queryParams.append('validTo', params.validTo);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      quotations: response.data.quotations,
      totalCount: response.data.pagination.totalCount,
      pagination: response.data.pagination,
      success: true
    };
  }

  /**
   * Get a single quotation by ID
   */
  async getQuotationById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  /**
   * Create a new quotation
   */
  async createQuotation(quotationData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });

    return response.data;
  }

  /**
   * Update an existing quotation
   */
  async updateQuotation(id, quotationData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quotationData),
    });

    return response.data;
  }

  /**
   * Delete a quotation
   */
  async deleteQuotation(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Send quotation via email
   */
  async sendQuotation(quotationId, emailData) {
    const response = await this.request(`/${quotationId}/send`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });

    return response.data;
  }

  /**
   * Update quotation status
   */
  async updateQuotationStatus(quotationId, status, additionalData = {}) {
    const response = await this.request(`/${quotationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        ...additionalData
      }),
    });

    return response.data;
  }

  /**
   * Get quotations statistics
   */
  async getQuotationsStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.agentId) queryParams.append('agentId', params.agentId);

    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Search quotations
   */
  async searchQuotations(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }
}

// Export singleton instance
export const quotationsBackendApi = new QuotationsBackendApiService();
export default quotationsBackendApi;
