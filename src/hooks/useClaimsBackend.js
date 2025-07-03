
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import claimsBackendApi from '../services/api/claimsApiBackend';

/**
 * React Query hooks for claims management with backend integration
 * Provides optimistic updates and proper error handling
 * Integrates with Node.js/Express/MongoDB backend
 */

// Query keys for cache management
export const claimsQueryKeys = {
  all: ['claims-backend'],
  lists: () => [...claimsQueryKeys.all, 'list'],
  list: (params) => [...claimsQueryKeys.lists(), params],
  details: () => [...claimsQueryKeys.all, 'detail'],
  detail: (id) => [...claimsQueryKeys.details(), id],
  documents: (id) => [...claimsQueryKeys.detail(id), 'documents'],
  notes: (id) => [...claimsQueryKeys.detail(id), 'notes'],
  timeline: (id) => [...claimsQueryKeys.detail(id), 'timeline'],
  stats: () => [...claimsQueryKeys.all, 'stats'],
  dashboardStats: () => [...claimsQueryKeys.stats(), 'dashboard'],
  search: (query) => [...claimsQueryKeys.all, 'search', query],
};

/**
 * Hook to fetch claims with filtering and pagination
 */
export const useClaimsBackend = (params = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.list(params),
    queryFn: () => claimsBackendApi.getClaims(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    },
  });
};

/**
 * Hook to fetch a single claim by ID
 */
export const useClaimBackend = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.detail(claimId),
    queryFn: () => claimsBackendApi.getClaimById(claimId),
    enabled: !!claimId, // Only run if claimId exists
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim:', error);
      toast.error('Failed to load claim details');
    },
  });
};

/**
 * Hook to create a new claim
 */
export const useCreateClaimBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimData) => {
      console.log('Creating claim with data:', claimData);
      
      // Basic validation
      if (!claimData.clientId || !claimData.policyId || !claimData.claimAmount) {
        throw new Error('Missing required fields: client, policy, or claim amount');
      }

      return claimsBackendApi.createClaim(claimData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch claims list
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim created successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error creating claim:', error);
      toast.error(`Failed to create claim: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing claim
 */
export const useUpdateClaimBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, claimData }) => {
      console.log('Updating claim with data:', claimData);
      
      return claimsBackendApi.updateClaim(id, claimData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      console.log('Claim updated successfully:', data);
    },
    onError: (error, variables) => {
      console.error('Error updating claim:', error);
      toast.error(`Failed to update claim: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a claim
 */
export const useDeleteClaimBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId) => claimsBackendApi.deleteClaim(claimId),
    onSuccess: (data, claimId) => {
      // Remove claim from cache
      queryClient.removeQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting claim:', error);
      toast.error(`Failed to delete claim: ${error.message}`);
    },
  });
};

/**
 * Hook to upload claim document
 */
export const useUploadClaimDocumentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file, name }) => 
      claimsBackendApi.uploadDocument(claimId, documentType, file, name),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      console.log('Document uploaded successfully:', data);
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

/**
 * Hook to get claim documents
 */
export const useClaimDocumentsBackend = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.documents(claimId),
    queryFn: () => claimsBackendApi.getClaimDocuments(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim documents:', error);
      toast.error('Failed to load claim documents');
    },
  });
};

/**
 * Hook to delete claim document
 */
export const useDeleteClaimDocumentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentId }) => 
      claimsBackendApi.deleteDocument(claimId, documentId),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      console.log('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

/**
 * Hook to update claim status
 */
export const useUpdateClaimStatusBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, status, reason, approvedAmount }) => 
      claimsBackendApi.updateClaimStatus(claimId, status, reason, approvedAmount),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Update specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(claimId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim status updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating claim status:', error);
      toast.error(`Failed to update claim status: ${error.message}`);
    },
  });
};

/**
 * Hook to add claim note
 */
export const useAddClaimNoteBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, noteData }) => claimsBackendApi.addNote(claimId, noteData),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate notes cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.notes(claimId) });
      
      // Invalidate claim details
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      console.log('Note added successfully:', data);
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook to get claim notes
 */
export const useClaimNotesBackend = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.notes(claimId),
    queryFn: () => claimsBackendApi.getClaimNotes(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim notes:', error);
      toast.error('Failed to load claim notes');
    },
  });
};

/**
 * Hook to search claims
 */
export const useSearchClaimsBackend = (query, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.search(query),
    queryFn: () => claimsBackendApi.searchClaims(query, options.limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error) => {
      console.error('Error searching claims:', error);
      toast.error('Failed to search claims');
    },
  });
};

/**
 * Hook to get claims statistics
 */
export const useClaimsStatsBackend = (params = {}) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.stats(), params],
    queryFn: () => claimsBackendApi.getClaimsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claims stats:', error);
      toast.error('Failed to load claims statistics');
    },
  });
};

/**
 * Hook to get dashboard statistics
 */
export const useClaimsDashboardStatsBackend = () => {
  return useQuery({
    queryKey: claimsQueryKeys.dashboardStats(),
    queryFn: () => claimsBackendApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    },
  });
};

/**
 * Hook to bulk update claims
 */
export const useBulkUpdateClaimsBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, updateData }) => 
      claimsBackendApi.bulkUpdateClaims(claimIds, updateData),
    onSuccess: (data, variables) => {
      // Invalidate all claims lists
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claims bulk updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error bulk updating claims:', error);
      toast.error(`Failed to update claims: ${error.message}`);
    },
  });
};

/**
 * Hook to export claims data
 */
export const useExportClaimsBackend = () => {
  return useMutation({
    mutationFn: (filters) => claimsBackendApi.exportClaims(filters),
    onSuccess: (data) => {
      console.log('Claims exported successfully:', data);
    },
    onError: (error) => {
      console.error('Error exporting claims:', error);
      toast.error(`Failed to export claims: ${error.message}`);
    },
  });
};

/**
 * Hook to get claim timeline
 */
export const useClaimTimelineBackend = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.timeline(claimId),
    queryFn: () => claimsBackendApi.getClaimTimeline(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim timeline:', error);
      toast.error('Failed to load claim timeline');
    },
  });
};

/**
 * Hook to get claim financials
 */
export const useClaimFinancialsBackend = (claimId) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.detail(claimId), 'financials'],
    queryFn: () => claimsBackendApi.getClaimFinancials(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim financials:', error);
      toast.error('Failed to load claim financials');
    },
  });
};

/**
 * Hook to process claim payment
 */
export const useProcessClaimPaymentBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, paymentData }) => 
      claimsBackendApi.processPayment(claimId, paymentData),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate claim details
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      // Invalidate financials
      queryClient.invalidateQueries({ queryKey: [...claimsQueryKeys.detail(claimId), 'financials'] });
      
      console.log('Payment processed successfully:', data);
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      toast.error(`Failed to process payment: ${error.message}`);
    },
  });
};
