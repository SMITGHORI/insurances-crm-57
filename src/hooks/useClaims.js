
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { claimsApi } from '../services/api/claimsApi';

/**
 * React Query hooks for claims management
 * Provides optimistic updates and proper error handling
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Query keys for cache management
export const claimsQueryKeys = {
  all: ['claims'],
  lists: () => [...claimsQueryKeys.all, 'list'],
  list: (params) => [...claimsQueryKeys.lists(), params],
  details: () => [...claimsQueryKeys.all, 'detail'],
  detail: (id) => [...claimsQueryKeys.details(), id],
  documents: (id) => [...claimsQueryKeys.detail(id), 'documents'],
  notes: (id) => [...claimsQueryKeys.detail(id), 'notes'],
  stats: () => [...claimsQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch claims with filtering and pagination
 */
export const useClaims = (params = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.list(params),
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (claimsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching claims:', error);
      if (!claimsApi.isOfflineMode) {
        toast.error('Failed to load claims - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single claim by ID
 */
export const useClaim = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.detail(claimId),
    queryFn: () => claimsApi.getClaimById(claimId),
    enabled: !!claimId, // Only run if claimId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (claimsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching claim:', error);
      if (!claimsApi.isOfflineMode) {
        toast.error('Failed to load claim details');
      }
    },
  });
};

/**
 * Hook to create a new claim
 */
export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimData) => {
      console.log('Creating claim with data:', claimData);
      
      // Basic validation
      if (!claimData.clientId || !claimData.policyId || !claimData.claimAmount) {
        throw new Error('Missing required fields: client, policy, or claim amount');
      }

      return claimsApi.createClaim(claimData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch claims list
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Claim "${data.claimNumber}" created successfully${mode}`);
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
export const useUpdateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, claimData }) => {
      console.log('Updating claim with data:', claimData);
      
      return claimsApi.updateClaim(id, claimData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Claim "${data.claimNumber}" updated successfully${mode}`);
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
export const useDeleteClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId) => claimsApi.deleteClaim(claimId),
    onSuccess: (data, claimId) => {
      // Remove claim from cache
      queryClient.removeQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Claim deleted successfully${mode}`);
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
export const useUploadClaimDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file }) => 
      claimsApi.uploadDocument(claimId, documentType, file),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Document uploaded successfully${mode}`);
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
export const useClaimDocuments = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.documents(claimId),
    queryFn: () => claimsApi.getClaimDocuments(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (claimsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching claim documents:', error);
      if (!claimsApi.isOfflineMode) {
        toast.error('Failed to load claim documents');
      }
    },
  });
};

/**
 * Hook to delete claim document
 */
export const useDeleteClaimDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentId }) => 
      claimsApi.deleteDocument(claimId, documentId),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Document deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

/**
 * Hook to add claim note
 */
export const useAddClaimNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, noteData }) => claimsApi.addNote(claimId, noteData),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate notes cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.notes(claimId) });
      
      // Invalidate claim details
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Note added successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook to update claim status
 */
export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, status, reason }) => 
      claimsApi.updateClaimStatus(claimId, status, reason),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Update specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(claimId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      const mode = claimsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Claim status updated successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error updating claim status:', error);
      toast.error(`Failed to update claim status: ${error.message}`);
    },
  });
};

/**
 * Hook to get claims statistics
 */
export const useClaimsStats = (params = {}) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.stats(), params],
    queryFn: () => claimsApi.getClaimsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (claimsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching claims stats:', error);
      if (!claimsApi.isOfflineMode) {
        toast.error('Failed to load claims statistics');
      }
    },
  });
};
