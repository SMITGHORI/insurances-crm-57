
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { agentsBackendApi } from '../services/api/agentsApiBackend';

/**
 * React Query hooks for agent management with backend API integration
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
  documents: (id) => [...agentsQueryKeys.detail(id), 'documents'],
  notes: (id) => [...agentsQueryKeys.detail(id), 'notes'],
  stats: ['agents', 'stats'],
  rankings: ['agents', 'rankings'],
  expiringLicenses: ['agents', 'expiring-licenses'],
};

/**
 * Hook to fetch agents with filtering and pagination
 */
export const useAgentsBackend = (params = {}) => {
  return useQuery({
    queryKey: agentsQueryKeys.list(params),
    queryFn: () => agentsBackendApi.getAgents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single agent by ID
 */
export const useAgentBackend = (agentId) => {
  return useQuery({
    queryKey: agentsQueryKeys.detail(agentId),
    queryFn: () => agentsBackendApi.getAgentById(agentId),
    enabled: !!agentId, // Only run if agentId exists
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new agent
 */
export const useCreateAgentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentData) => agentsBackendApi.createAgent(agentData),
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating agent:', error);
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing agent
 */
export const useUpdateAgentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, agentData }) => agentsBackendApi.updateAgent(id, agentData),
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific agent in cache
      queryClient.setQueryData(agentsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Error updating agent:', error);
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });
};

/**
 * Hook to delete an agent
 */
export const useDeleteAgentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId) => agentsBackendApi.deleteAgent(agentId),
    onSuccess: (_, agentId) => {
      // Remove agent from cache
      queryClient.removeQueries({ queryKey: agentsQueryKeys.detail(agentId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.lists() });
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
export const useAgentClientsBackend = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.clients(agentId), params],
    queryFn: () => agentsBackendApi.getAgentClients(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch agent's policies
 */
export const useAgentPoliciesBackend = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.policies(agentId), params],
    queryFn: () => agentsBackendApi.getAgentPolicies(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch agent's commissions
 */
export const useAgentCommissionsBackend = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.commissions(agentId), params],
    queryFn: () => agentsBackendApi.getAgentCommissions(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch agent's performance data
 */
export const useAgentPerformanceBackend = (agentId, params = {}) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.performance(agentId), params],
    queryFn: () => agentsBackendApi.getAgentPerformance(agentId, params),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to update agent performance targets
 */
export const useUpdatePerformanceTargetsBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, targetsData }) => 
      agentsBackendApi.updatePerformanceTargets(agentId, targetsData),
    onSuccess: (_, variables) => {
      const { agentId } = variables;
      
      // Invalidate performance data for this agent
      queryClient.invalidateQueries({ 
        queryKey: agentsQueryKeys.performance(agentId) 
      });
      
      // Invalidate agent detail
      queryClient.invalidateQueries({ 
        queryKey: agentsQueryKeys.detail(agentId) 
      });
    },
    onError: (error) => {
      console.error('Error updating performance targets:', error);
      toast.error(`Failed to update performance targets: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch agent documents
 */
export const useAgentDocumentsBackend = (agentId) => {
  return useQuery({
    queryKey: agentsQueryKeys.documents(agentId),
    queryFn: () => agentsBackendApi.getAgentDocuments(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to upload agent document
 */
export const useUploadDocumentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, documentType, file, name }) => 
      agentsBackendApi.uploadDocument(agentId, documentType, file, name),
    onSuccess: (_, variables) => {
      const { agentId } = variables;
      
      // Invalidate documents for this agent
      queryClient.invalidateQueries({ 
        queryKey: agentsQueryKeys.documents(agentId) 
      });
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

/**
 * Hook to delete agent document
 */
export const useDeleteDocumentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, documentId }) => 
      agentsBackendApi.deleteDocument(agentId, documentId),
    onSuccess: (_, variables) => {
      const { agentId } = variables;
      
      // Invalidate documents for this agent
      queryClient.invalidateQueries({ 
        queryKey: agentsQueryKeys.documents(agentId) 
      });
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch agent notes
 */
export const useAgentNotesBackend = (agentId) => {
  return useQuery({
    queryKey: agentsQueryKeys.notes(agentId),
    queryFn: () => agentsBackendApi.getAgentNotes(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to add note to agent
 */
export const useAddNoteBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, noteData }) => 
      agentsBackendApi.addNote(agentId, noteData),
    onSuccess: (_, variables) => {
      const { agentId } = variables;
      
      // Invalidate notes for this agent
      queryClient.invalidateQueries({ 
        queryKey: agentsQueryKeys.notes(agentId) 
      });
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch agent statistics
 */
export const useAgentStatsBackend = () => {
  return useQuery({
    queryKey: agentsQueryKeys.stats,
    queryFn: () => agentsBackendApi.getAgentStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to fetch agent performance rankings
 */
export const usePerformanceRankingsBackend = (period, metric) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.rankings, period, metric],
    queryFn: () => agentsBackendApi.getPerformanceRankings(period, metric),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to fetch agents with expiring licenses
 */
export const useExpiringLicensesBackend = (days = 30) => {
  return useQuery({
    queryKey: [...agentsQueryKeys.expiringLicenses, days],
    queryFn: () => agentsBackendApi.getExpiringLicenses(days),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Hook to bulk update agents
 */
export const useBulkUpdateAgentsBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentIds, updateData }) => 
      agentsBackendApi.bulkUpdateAgents(agentIds, updateData),
    onSuccess: () => {
      // Invalidate all agent lists and details
      queryClient.invalidateQueries({ queryKey: agentsQueryKeys.all });
    },
    onError: (error) => {
      console.error('Error bulk updating agents:', error);
      toast.error(`Failed to bulk update agents: ${error.message}`);
    },
  });
};

/**
 * Hook to export agents data
 */
export const useExportAgentsBackend = () => {
  return useMutation({
    mutationFn: (filters) => agentsBackendApi.exportAgents(filters),
    onSuccess: (data) => {
      toast.success(`Successfully exported ${data.totalRecords} agents`);
    },
    onError: (error) => {
      console.error('Error exporting agents:', error);
      toast.error(`Failed to export agents: ${error.message}`);
    },
  });
};
