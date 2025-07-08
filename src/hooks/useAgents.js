
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { agentsApi } from '../services/api/agentsApi';

/**
 * React Query hooks for agent management
 * Provides optimistic updates and proper error handling
 * Works with both backend API and offline mock data
 */

// Query keys for cache management
export const agentsQueryKeys = {
  all: ['agents'],
  lists: () => [...agentsQueryKeys.all, 'list'],
  list: (params) => [...agentsQueryKeys.lists(), params],
  details: () => [...agentsQueryKeys.all, 'detail'],
  detail: (id) => [...agentsQueryKeys.details(), id],
  clients: (id) => [...agentsQueryKeys.detail(id), 'clients'],
  policies: (id) => [...agentsQueryKeys.detail(id), 'policies'],
  commissions: (id) => [...agentsQueryKeys.detail(id), 'commissions'],
  performance: (id) => [...agentsQueryKeys.detail(id), 'performance'],
};

/**
 * Hook to fetch agents with filtering and pagination
 */
export const useAgents = (params = {}) => {
  return useQuery({
    queryKey: agentsQueryKeys.list(params),
    queryFn: () => agentsApi.getAgents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching agents:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agents');
      }
    },
  });
};

/**
 * Hook to fetch a single agent by ID
 */
export const useAgent = (agentId) => {
  return useQuery({
    queryKey: agentsQueryKeys.detail(agentId),
    queryFn: () => agentsApi.getAgentById(agentId),
    enabled: !!agentId, // Only run if agentId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent details');
      }
    },
  });
};

/**
 * Hook to create a new agent
 */
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentData) => {
      console.log('Creating agent with data:', agentData);
      
      // Basic validation
      if (!agentData.name || !agentData.email || !agentData.phone) {
        throw new Error('Missing required fields: name, email, or phone');
      }

      return agentsApi.createAgent(agentData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
      
      const mode = agentsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Agent "${data.name}" created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating agent:', error);
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing agent
 */
export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, agentData }) => {
      console.log('Updating agent with data:', agentData);
      
      // Basic validation
      if (!agentData.name || !agentData.email || !agentData.phone) {
        throw new Error('Missing required fields: name, email, or phone');
      }

      return agentsApi.updateAgent(id, agentData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific agent in cache
      queryClient.setQueryData(agentsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
      
      const mode = agentsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Agent "${data.name}" updated successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error updating agent:', error);
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });
};

/**
 * Hook to delete an agent
 */
export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId) => agentsApi.deleteAgent(agentId),
    onSuccess: (data, agentId) => {
      // Remove agent from cache
      queryClient.removeQueries({ queryKey: agentsQueryKeys.detail(agentId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
      
      const mode = agentsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Agent deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting agent:', error);
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch agent's clients
 */
export const useAgentClients = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.clients(agentId), params],
    queryFn: () => agentsApi.getAgentClients(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent clients:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent clients');
      }
    },
  });
};

/**
 * Hook to fetch agent's policies
 */
export const useAgentPolicies = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.policies(agentId), params],
    queryFn: () => agentsApi.getAgentPolicies(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent policies:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent policies');
      }
    },
  });
};

/**
 * Hook to fetch agent's commissions
 */
export const useAgentCommissions = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.commissions(agentId), params],
    queryFn: () => agentsApi.getAgentCommissions(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent commissions:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent commissions');
      }
    },
  });
};

/**
 * Hook to fetch agent's performance data
 */
export const useAgentPerformance = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.performance(agentId), params],
    queryFn: () => agentsApi.getAgentPerformance(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent performance:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent performance data');
      }
    },
  });
};

/**
 * Hook to fetch agent's commission summary (monthly breakdown)
 */
export const useAgentCommissionSummary = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.commissions(agentId), 'summary', params],
    queryFn: () => agentsApi.getAgentCommissionSummary(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (agentsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching agent commission summary:', error);
      if (!agentsApi.isOfflineMode) {
        toast.error('Failed to load agent commission summary');
      }
    },
  });
};

// Alias for backward compatibility
export const useAgentById = useAgent;
