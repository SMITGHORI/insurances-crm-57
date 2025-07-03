
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import leadsApi from '../services/api/leadsApi';

/**
 * React Query hooks for leads management
 * Connects directly to MongoDB backend through Express API
 * All demo data removed - using real database operations
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
  search: (query) => [...leadsQueryKeys.all, 'search', query],
};

/**
 * Hook to fetch leads with filtering and pagination
 */
export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.list(params),
    queryFn: () => leadsApi.getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching leads from MongoDB:', error);
      toast.error('Failed to load leads from database');
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
    retry: 2,
    onError: (error) => {
      console.error('Error fetching lead from MongoDB:', error);
      toast.error('Failed to load lead details from database');
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
      console.log('Creating lead in MongoDB with data:', leadData);
      
      // Basic validation
      if (!leadData.name || !leadData.phone || !leadData.email) {
        throw new Error('Missing required fields: name, phone, or email');
      }

      return leadsApi.createLead(leadData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch leads list
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      
      console.log('Lead created successfully in MongoDB:', data);
      toast.success(`Lead "${data.name}" created successfully`);
    },
    onError: (error, variables) => {
      console.error('Error creating lead in MongoDB:', error);
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
      console.log('Updating lead in MongoDB with data:', leadData);
      
      return leadsApi.updateLead(id, leadData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific lead in cache
      queryClient.setQueryData(leadsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      console.log('Lead updated successfully in MongoDB:', data);
      toast.success(`Lead "${data.name}" updated successfully`);
    },
    onError: (error, variables) => {
      console.error('Error updating lead in MongoDB:', error);
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
    mutationFn: (leadId) => {
      console.log('Deleting lead from MongoDB:', leadId);
      return leadsApi.deleteLead(leadId);
    },
    onSuccess: (data, leadId) => {
      // Remove lead from cache
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      
      console.log('Lead deleted successfully from MongoDB');
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting lead from MongoDB:', error);
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
    mutationFn: ({ leadId, followUpData }) => {
      console.log('Adding follow-up to lead in MongoDB:', leadId, followUpData);
      return leadsApi.addFollowUp(leadId, followUpData);
    },
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Invalidate follow-ups cache
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.followUps(leadId) });
      
      // Invalidate lead details to refresh follow-up count
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      console.log('Follow-up added successfully to MongoDB:', data);
      toast.success('Follow-up added successfully');
    },
    onError: (error) => {
      console.error('Error adding follow-up to MongoDB:', error);
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
    mutationFn: ({ leadId, noteData }) => {
      console.log('Adding note to lead in MongoDB:', leadId, noteData);
      return leadsApi.addNote(leadId, noteData);
    },
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Invalidate notes cache
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) });
      
      // Invalidate lead details to refresh note count
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      console.log('Note added successfully to MongoDB:', data);
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Error adding note to MongoDB:', error);
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
    mutationFn: ({ leadId, agentData }) => {
      console.log('Assigning lead to agent in MongoDB:', leadId, agentData);
      return leadsApi.assignLead(leadId, agentData);
    },
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      
      // Update specific lead in cache
      queryClient.setQueryData(leadsQueryKeys.detail(leadId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      console.log('Lead assigned successfully in MongoDB:', data);
      toast.success('Lead assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning lead in MongoDB:', error);
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
    mutationFn: (leadId) => {
      console.log('Converting lead to client in MongoDB:', leadId);
      return leadsApi.convertToClient(leadId);
    },
    onSuccess: (data, leadId) => {
      // Invalidate leads cache to refresh status
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      
      console.log('Lead converted to client successfully in MongoDB:', data);
      toast.success('Lead converted to client successfully');
    },
    onError: (error) => {
      console.error('Error converting lead to client in MongoDB:', error);
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
    retry: 2,
    onError: (error) => {
      console.error('Error fetching leads stats from MongoDB:', error);
      toast.error('Failed to load leads statistics from database');
    },
  });
};

/**
 * Hook to search leads
 */
export const useSearchLeads = (query, limit = 10) => {
  return useQuery({
    queryKey: leadsQueryKeys.search(query),
    queryFn: () => leadsApi.searchLeads(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error) => {
      console.error('Error searching leads in MongoDB:', error);
      toast.error('Failed to search leads in database');
    },
  });
};

/**
 * Hook to get lead funnel report
 */
export const useLeadFunnelReport = (params = {}) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.all, 'funnel', params],
    queryFn: () => leadsApi.getLeadFunnelReport(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching lead funnel report from MongoDB:', error);
      toast.error('Failed to load funnel report from database');
    },
  });
};

/**
 * Hook to get stale leads
 */
export const useStaleLeads = (days = 7) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.all, 'stale', days],
    queryFn: () => leadsApi.getStaleLeads(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching stale leads from MongoDB:', error);
      toast.error('Failed to load stale leads from database');
    },
  });
};

/**
 * Hook to bulk update leads
 */
export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadIds, updateData }) => {
      console.log('Bulk updating leads in MongoDB:', leadIds, updateData);
      return leadsApi.bulkUpdateLeads(leadIds, updateData);
    },
    onSuccess: (data) => {
      // Invalidate all leads lists
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      
      console.log('Leads bulk updated successfully in MongoDB:', data);
      toast.success(`${data.successful} leads updated successfully`);
    },
    onError: (error) => {
      console.error('Error bulk updating leads in MongoDB:', error);
      toast.error(`Failed to update leads: ${error.message}`);
    },
  });
};

/**
 * Hook to export leads data
 */
export const useExportLeads = () => {
  return useMutation({
    mutationFn: (exportData) => {
      console.log('Exporting leads from MongoDB:', exportData);
      return leadsApi.exportLeads(exportData);
    },
    onSuccess: (data) => {
      console.log('Leads exported successfully from MongoDB:', data);
      toast.success(`${data.count} leads exported successfully`);
    },
    onError: (error) => {
      console.error('Error exporting leads from MongoDB:', error);
      toast.error(`Failed to export leads: ${error.message}`);
    },
  });
};
