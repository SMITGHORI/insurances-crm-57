
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class InteractionsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/interactions`;
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
      console.error('Interactions API Request failed:', error.message);
      throw error;
    }
  }

  async getInteractions(params = {}) {
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

  async getInteractionById(id) {
    const response = await this.request(`/${id}`);
    return response.data;
  }

  async createInteraction(interactionData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
    return response.data;
  }

  async updateInteraction(id, interactionData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interactionData),
    });
    return response.data;
  }

  async deleteInteraction(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  async getInteractionsByClient(clientId) {
    const response = await this.request(`/client/${clientId}`);
    return response.data;
  }

  async uploadAttachment(interactionId, file) {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await this.request(`/${interactionId}/attachments`, {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
    });
    return response.data;
  }

  async getInteractionStats(params = {}) {
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

export const interactionsApi = new InteractionsApiService();
export default interactionsApi;
