
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Enhanced Broadcast API service
class EnhancedBroadcastApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/enhanced-broadcast`;
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
      console.error('Enhanced Broadcast API Request failed:', error.message);
      throw error;
    }
  }

  async getBroadcasts(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    return response.data;
  }

  async createBroadcast(broadcastData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });
    return response.data;
  }

  async getBroadcastAnalytics(broadcastId) {
    const response = await this.request(`/${broadcastId}/analytics`);
    return response.data;
  }

  async approveBroadcast(broadcastId, action, reason) {
    const response = await this.request(`/${broadcastId}/approval`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
    return response.data;
  }

  async manageAbTest(broadcastId, action, variantData) {
    const response = await this.request(`/${broadcastId}/ab-test`, {
      method: 'POST',
      body: JSON.stringify({ action, variantData }),
    });
    return response.data;
  }

  async getTemplates(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/templates${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data;
  }

  async createTemplate(templateData) {
    const response = await this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return response.data;
  }

  async triggerAutomation(triggerType) {
    const response = await this.request(`/triggers/${triggerType}`, {
      method: 'POST',
    });
    return response.data;
  }
}

// Export singleton instance
export const enhancedBroadcastApi = new EnhancedBroadcastApiService();

// Query keys
const broadcastQueryKeys = {
  all: ['enhanced-broadcasts'],
  lists: () => [...broadcastQueryKeys.all, 'list'],
  list: (params) => [...broadcastQueryKeys.lists(), params],
  details: () => [...broadcastQueryKeys.all, 'detail'],
  detail: (id) => [...broadcastQueryKeys.details(), id],
  analytics: (id) => [...broadcastQueryKeys.all, 'analytics', id],
  templates: ['broadcast-templates'],
};

// Hooks
export const useEnhancedBroadcasts = (params = {}) => {
  return useQuery({
    queryKey: broadcastQueryKeys.list(params),
    queryFn: () => enhancedBroadcastApi.getBroadcasts(params),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching broadcasts:', error);
      toast.error('Failed to load broadcasts');
    },
  });
};

export const useCreateEnhancedBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastData) => {
      return enhancedBroadcastApi.createBroadcast(broadcastData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      toast.success('Broadcast created successfully');
    },
    onError: (error) => {
      console.error('Error creating broadcast:', error);
      toast.error(`Failed to create broadcast: ${error.message}`);
    },
  });
};

export const useBroadcastAnalytics = (broadcastId) => {
  return useQuery({
    queryKey: broadcastQueryKeys.analytics(broadcastId),
    queryFn: () => enhancedBroadcastApi.getBroadcastAnalytics(broadcastId),
    enabled: !!broadcastId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    },
  });
};

export const useApproveBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ broadcastId, action, reason }) => {
      return enhancedBroadcastApi.approveBroadcast(broadcastId, action, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.lists() });
      toast.success('Broadcast approval updated successfully');
    },
    onError: (error) => {
      console.error('Error updating approval:', error);
      toast.error(`Failed to update approval: ${error.message}`);
    },
  });
};

export const useAutomatedTriggers = () => {
  return useMutation({
    mutationFn: async (triggerType) => {
      return enhancedBroadcastApi.triggerAutomation(triggerType);
    },
    onSuccess: (data, triggerType) => {
      toast.success(`${triggerType} automation triggered successfully`);
    },
    onError: (error) => {
      console.error('Error triggering automation:', error);
      toast.error(`Failed to trigger automation: ${error.message}`);
    },
  });
};

export const useBroadcastTemplates = (params = {}) => {
  return useQuery({
    queryKey: [...broadcastQueryKeys.templates, params],
    queryFn: () => enhancedBroadcastApi.getTemplates(params),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    },
  });
};

export const useCreateBroadcastTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData) => {
      return enhancedBroadcastApi.createTemplate(templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.templates });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
};
