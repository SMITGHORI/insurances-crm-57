
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Backend API service for communication operations
 * Connects to your Node.js + Express + MongoDB backend
 */
class CommunicationBackendApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/communication`;
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
   * Get all communications with filtering and pagination
   */
  async getCommunications(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.channel) queryParams.append('channel', params.channel);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination.totalItems,
      totalPages: response.pagination.totalPages,
      currentPage: response.pagination.currentPage,
      success: true
    };
  }

  /**
   * Send manual communication
   */
  async sendCommunication(communicationData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });

    return response.data;
  }

  /**
   * Get client loyalty points
   */
  async getLoyaltyPoints(clientId) {
    const response = await this.request(`/loyalty/${clientId}`);
    return response.data;
  }

  /**
   * Update client loyalty points
   */
  async updateLoyaltyPoints(clientId, pointsData) {
    const response = await this.request(`/loyalty/${clientId}`, {
      method: 'POST',
      body: JSON.stringify(pointsData),
    });

    return response.data;
  }

  /**
   * Get active offers
   */
  async getOffers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.applicableProduct) queryParams.append('applicableProduct', params.applicableProduct);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = `/offers${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination.totalItems,
      totalPages: response.pagination.totalPages,
      currentPage: response.pagination.currentPage,
      success: true
    };
  }

  /**
   * Create new offer
   */
  async createOffer(offerData) {
    const response = await this.request('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });

    return response.data;
  }

  /**
   * Get automation rules
   */
  async getAutomationRules(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = `/automation${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination.totalItems,
      totalPages: response.pagination.totalPages,
      currentPage: response.pagination.currentPage,
      success: true
    };
  }

  /**
   * Create automation rule
   */
  async createAutomationRule(ruleData) {
    const response = await this.request('/automation', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });

    return response.data;
  }

  /**
   * Get communication statistics
   */
  async getStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Get clients with upcoming birthdays
   */
  async getUpcomingBirthdays(days = 7) {
    const response = await this.request(`/upcoming-birthdays?days=${days}`);
    return response.data;
  }

  /**
   * Get clients with upcoming anniversaries
   */
  async getUpcomingAnniversaries(days = 7) {
    const response = await this.request(`/upcoming-anniversaries?days=${days}`);
    return response.data;
  }

  /**
   * Trigger manual birthday greetings
   */
  async triggerBirthdayGreetings() {
    const response = await this.request('/trigger-birthdays', {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Trigger manual anniversary greetings
   */
  async triggerAnniversaryGreetings() {
    const response = await this.request('/trigger-anniversaries', {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Send bulk communications
   */
  async sendBulkCommunication(communicationData) {
    const response = await this.request('/bulk', {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });

    return response.data;
  }

  /**
   * Get communication templates
   */
  async getTemplates(type = null) {
    const endpoint = `/templates${type ? `?type=${type}` : ''}`;
    const response = await this.request(endpoint);
    return response.data;
  }

  /**
   * Create communication template
   */
  async createTemplate(templateData) {
    const response = await this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });

    return response.data;
  }

  /**
   * Update communication template
   */
  async updateTemplate(templateId, templateData) {
    const response = await this.request(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });

    return response.data;
  }

  /**
   * Delete communication template
   */
  async deleteTemplate(templateId) {
    const response = await this.request(`/templates/${templateId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Get eligible clients for offers
   */
  async getEligibleClients(offerId) {
    const response = await this.request(`/offers/${offerId}/eligible-clients`);
    return response.data;
  }

  /**
   * Preview communication before sending
   */
  async previewCommunication(communicationData) {
    const response = await this.request('/preview', {
      method: 'POST',
      body: JSON.stringify(communicationData),
    });

    return response.data;
  }

  /**
   * Get communication delivery status
   */
  async getDeliveryStatus(communicationId) {
    const response = await this.request(`/${communicationId}/status`);
    return response.data;
  }

  /**
   * Resend failed communication
   */
  async resendCommunication(communicationId) {
    const response = await this.request(`/${communicationId}/resend`, {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Get loyalty tier benefits
   */
  async getTierBenefits() {
    const response = await this.request('/loyalty/tier-benefits');
    return response.data;
  }

  /**
   * Export communication data
   */
  async exportCommunications(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const communicationBackendApi = new CommunicationBackendApiService();
export default communicationBackendApi;
