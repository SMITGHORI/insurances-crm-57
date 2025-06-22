
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsBackendApi } from '../services/api/leadsApiBackend';
import { toast } from 'sonner';

// Enhanced hooks for leads backend operations

/**
 * Get leads with filtering and pagination
 */
export const useLeadsBackend = (params = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsBackendApi.getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Get single lead by ID
 */
export const useLead = (leadId) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => leadsBackendApi.getLeadById(leadId),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Get leads statistics
 */
export const useLeadsStatsBackend = (params = {}) => {
  return useQuery({
    queryKey: ['leads-stats', params],
    queryFn: () => leadsBackendApi.getLeadsStats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

/**
 * Get lead funnel report
 */
export const useLeadFunnelReportBackend = (params = {}) => {
  return useQuery({
    queryKey: ['lead-funnel-report', params],
    queryFn: () => leadsBackendApi.getLeadFunnelReport(params),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Get stale leads
 */
export const useStaleLeadsBackend = (days = 7) => {
  return useQuery({
    queryKey: ['stale-leads', days],
    queryFn: () => leadsBackendApi.getStaleLeads(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

/**
 * Search leads
 */
export const useSearchLeadsBackend = (query, limit = 10) => {
  return useQuery({
    queryKey: ['search-leads', query, limit],
    queryFn: () => leadsBackendApi.searchLeads(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

/**
 * Create new lead
 */
export const useCreateLeadBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (leadData) => leadsBackendApi.createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
};

/**
 * Update lead
 */
export const useUpdateLeadBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, data }) => leadsBackendApi.updateLead(leadId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });
};

/**
 * Delete lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (leadId) => leadsBackendApi.deleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lead');
    },
  });
};

/**
 * Add follow-up to lead
 */
export const useAddFollowUpBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, followUpData }) => leadsBackendApi.addFollowUp(leadId, followUpData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Follow-up added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add follow-up');
    },
  });
};

/**
 * Add note to lead
 */
export const useAddNoteBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, noteData }) => leadsBackendApi.addNote(leadId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
};

/**
 * Assign lead to agent
 */
export const useAssignLeadBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, assignmentData }) => leadsBackendApi.assignLead(leadId, assignmentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Lead assigned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign lead');
    },
  });
};

/**
 * Convert lead to client
 */
export const useConvertToClientBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (leadId) => leadsBackendApi.convertToClient(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Lead converted to client successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert lead');
    },
  });
};

/**
 * Bulk update leads
 */
export const useBulkUpdateLeadsBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadIds, updateData }) => leadsBackendApi.bulkUpdateLeads(leadIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      toast.success('Leads updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update leads');
    },
  });
};

/**
 * Export leads
 */
export const useExportLeadsBackend = () => {
  return useMutation({
    mutationFn: (exportData) => leadsBackendApi.exportLeads(exportData),
    onSuccess: () => {
      toast.success('Leads exported successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export leads');
    },
  });
};
