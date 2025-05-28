
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadsApi } from '../services/api/leadsApi';

/**
 * React Query hooks for leads management
 * Provides optimistic updates and proper error handling
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Query keys for cache management
export const leadsQueryKeys = {
  all: ['leads'],
  lists: () => [...leadsQueryKeys.all, 'list'],
  list: (params) => [...leadsQueryKeys.lists(), params],
  details: () => [...leadsQueryKeys.all, 'detail'],
  detail: (id) => [...leadsQueryKeys.details(), id],
  followUps: (id) => [...leadsQueryKeys.detail(id), 'followUps'],
  notes: (id) => [...leadsQueryKeys.detail(id), 'notes'],
  stats: () => [...leadsQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch leads with filtering and pagination
 */
export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.list(params),
    queryFn: () => leadsApi.getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (leadsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching leads:', error);
      if (!leadsApi.isOfflineMode) {
        toast.error('Failed to load leads - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single lead by ID
 */
export const useLead = (leadId) => {
  return useQuery({
    queryKey: leadsQueryKeys.detail(leadId),
    queryFn: () => leadsApi.getLeadById(leadId),
    enabled: !!leadId, // Only run if leadId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (leadsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching lead:', error);
      if (!leadsApi.isOfflineMode) {
        toast.error('Failed to load lead details');
      }
    },
  });
};

/**
 * Hook to create a new lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData) => {
      console.log('Creating lead with data:', leadData);
      
      // Basic validation
      if (!leadData.name || !leadData.phone || !leadData.email) {
        throw new Error('Missing required fields: name, phone, or email');
      }

      return leadsApi.createLead(leadData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch leads list
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Lead "${data.name}" created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating lead:', error);
      toast.error(`Failed to create lead: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadData }) => {
      console.log('Updating lead with data:', leadData);
      
      return leadsApi.updateLead(id, leadData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific lead in cache
      queryClient.setQueryData(leadsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Lead "${data.name}" updated successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error updating lead:', error);
      toast.error(`Failed to update lead: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId) => leadsApi.deleteLead(leadId),
    onSuccess: (data, leadId) => {
      // Remove lead from cache
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Lead deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });
};

/**
 * Hook to add follow-up to lead
 */
export const useAddFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, followUpData }) => leadsApi.addFollowUp(leadId, followUpData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Invalidate follow-ups cache
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.followUps(leadId) });
      
      // Invalidate lead details to refresh follow-up count
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Follow-up added successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error adding follow-up:', error);
      toast.error(`Failed to add follow-up: ${error.message}`);
    },
  });
};

/**
 * Hook to add note to lead
 */
export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteData }) => leadsApi.addNote(leadId, noteData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Invalidate notes cache
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) });
      
      // Invalidate lead details to refresh note count
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Note added successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook to assign lead to agent
 */
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, agentData }) => leadsApi.assignLead(leadId, agentData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Update specific lead in cache
      queryClient.setQueryData(leadsQueryKeys.detail(leadId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Lead assigned successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error assigning lead:', error);
      toast.error(`Failed to assign lead: ${error.message}`);
    },
  });
};

/**
 * Hook to convert lead to client
 */
export const useConvertToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId) => leadsApi.convertToClient(leadId),
    onSuccess: (data, leadId) => {
      // Invalidate leads cache to refresh status
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      const mode = leadsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Lead converted to client successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error converting lead to client:', error);
      toast.error(`Failed to convert lead to client: ${error.message}`);
    },
  });
};

/**
 * Hook to get leads statistics
 */
export const useLeadsStats = (params = {}) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.stats(), params],
    queryFn: () => leadsApi.getLeadsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (leadsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching leads stats:', error);
      if (!leadsApi.isOfflineMode) {
        toast.error('Failed to load leads statistics');
      }
    },
  });
};
