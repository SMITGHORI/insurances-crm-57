
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { enhancedBroadcastApi } from '@/services/api/enhancedBroadcastApi';

// Query keys
const broadcastQueryKeys = {
  all: ['enhanced-broadcasts'],
  lists: () => [...broadcastQueryKeys.all, 'list'],
  list: (params) => [...broadcastQueryKeys.lists(), params],
  details: () => [...broadcastQueryKeys.all, 'detail'],
  detail: (id) => [...broadcastQueryKeys.details(), id],
  analytics: (id) => [...broadcastQueryKeys.all, 'analytics', id],
  templates: ['broadcast-templates'],
  eligibleClients: ['eligible-clients'],
  approvals: ['broadcast-approvals'],
};

// Enhanced Broadcast Hooks
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
      queryClient.invalidateQueries({ queryKey: broadcastQueryKeys.approvals });
      toast.success('Broadcast approval updated successfully');
    },
    onError: (error) => {
      console.error('Error updating approval:', error);
      toast.error(`Failed to update approval: ${error.message}`);
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

export const useEligibleClients = () => {
  return useMutation({
    mutationFn: async (targetAudience) => {
      return enhancedBroadcastApi.getEligibleClients(targetAudience);
    },
    onError: (error) => {
      console.error('Error fetching eligible clients:', error);
      toast.error('Failed to load eligible clients');
    },
  });
};

export const useUpdateClientPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, preferences }) => {
      return enhancedBroadcastApi.updateClientPreferences(clientId, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error(`Failed to update preferences: ${error.message}`);
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

export const useBroadcastStats = (broadcastId) => {
  return useQuery({
    queryKey: ['broadcast-stats', broadcastId],
    queryFn: () => enhancedBroadcastApi.getBroadcastStats(broadcastId),
    enabled: !!broadcastId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching broadcast stats:', error);
      toast.error('Failed to load broadcast statistics');
    },
  });
};
