
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class FollowUpsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/follow-ups`;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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
      console.error('Follow-ups API Request failed:', error.message);
      throw error;
    }
  }

  async getFollowUps(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      data: response.data,
      total: response.pagination?.totalItems || response.data.length,
      totalPages: response.pagination?.totalPages || 1,
      currentPage: response.pagination?.currentPage || 1,
      success: true
    };
  }

  async getFollowUpById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  async createFollowUp(followUpData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
    return response.data;
  }

  async updateFollowUp(id, followUpData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(followUpData),
    });
    return response.data;
  }

  async completeFollowUp(id, completionData) {
    const response = await this.request(`/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
    return response.data;
  }

  async getTodaysFollowUps() {
    const response = await this.request('/today/list');
    return response.data;
  }

  async getOverdueFollowUps() {
    const response = await this.request('/overdue/list');
    return response.data;
  }

  async getFollowUpStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/stats/summary${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }
}

export const followUpsApi = new FollowUpsApiService();
export default followUpsApi;
