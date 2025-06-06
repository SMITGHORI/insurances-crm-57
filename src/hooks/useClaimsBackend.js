
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsBackendApi } from '../services/api/claimsApiBackend';
import { toast } from 'sonner';

/**
 * React Query hooks for Claims Backend API integration
 * Provides data fetching, caching, and state management for claims
 */

// Query keys for consistent cache management
export const claimsQueryKeys = {
  all: ['claims'],
  lists: () => [...claimsQueryKeys.all, 'list'],
  list: (filters) => [...claimsQueryKeys.lists(), filters],
  details: () => [...claimsQueryKeys.all, 'detail'],
  detail: (id) => [...claimsQueryKeys.details(), id],
  stats: () => [...claimsQueryKeys.all, 'stats'],
  documents: (claimId) => [...claimsQueryKeys.all, 'documents', claimId],
  notes: (claimId) => [...claimsQueryKeys.all, 'notes', claimId],
  search: (query) => [...claimsQueryKeys.all, 'search', query],
  reports: () => [...claimsQueryKeys.all, 'reports'],
  dashboard: () => [...claimsQueryKeys.all, 'dashboard'],
};

/**
 * Hook to fetch claims with filtering, pagination, and caching
 */
export const useClaims = (params = {}, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.list(params),
    queryFn: () => claimsBackendApi.getClaims(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook to fetch a single claim by ID
 */
export const useClaim = (claimId, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.detail(claimId),
    queryFn: () => claimsBackendApi.getClaimById(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch claims statistics
 */
export const useClaimsStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.stats(),
    queryFn: () => claimsBackendApi.getClaimsStats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch dashboard statistics
 */
export const useClaimsDashboard = (options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.dashboard(),
    queryFn: () => claimsBackendApi.getDashboardStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch claim documents
 */
export const useClaimDocuments = (claimId, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.documents(claimId),
    queryFn: () => claimsBackendApi.getClaimDocuments(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch claim notes
 */
export const useClaimNotes = (claimId, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.notes(claimId),
    queryFn: () => claimsBackendApi.getClaimNotes(claimId),
    enabled: !!claimId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to search claims
 */
export const useClaimsSearch = (query, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.search(query),
    queryFn: () => claimsBackendApi.searchClaims(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch claims aging report
 */
export const useClaimsAgingReport = (options = {}) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.reports(), 'aging'],
    queryFn: () => claimsBackendApi.getClaimsAgingReport(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch settlement report
 */
export const useSettlementReport = (options = {}) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.reports(), 'settlement'],
    queryFn: () => claimsBackendApi.getSettlementReport(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Mutation hook to create a new claim
 */
export const useCreateClaim = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData) => claimsBackendApi.createClaim(claimData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch claims lists
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboard() });
      
      // Add the new claim to the cache
      queryClient.setQueryData(claimsQueryKeys.detail(data._id), data);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create claim');
    },
    ...options,
  });
};

/**
 * Mutation hook to update a claim
 */
export const useUpdateClaim = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...claimData }) => claimsBackendApi.updateClaim(id, claimData),
    onSuccess: (data, variables) => {
      // Update the specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(variables.id), data);
      
      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update claim');
    },
    ...options,
  });
};

/**
 * Mutation hook to delete a claim
 */
export const useDeleteClaim = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId) => claimsBackendApi.deleteClaim(claimId),
    onSuccess: (data, claimId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete claim');
    },
    ...options,
  });
};

/**
 * Mutation hook to upload claim document
 */
export const useUploadClaimDocument = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file, name }) => 
      claimsBackendApi.uploadDocument(claimId, documentType, file, name),
    onSuccess: (data, variables) => {
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(variables.claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(variables.claimId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document');
    },
    ...options,
  });
};

/**
 * Mutation hook to delete claim document
 */
export const useDeleteClaimDocument = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentId }) => 
      claimsBackendApi.deleteDocument(claimId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(variables.claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(variables.claimId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete document');
    },
    ...options,
  });
};

/**
 * Mutation hook to update claim status
 */
export const useUpdateClaimStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, ...statusData }) => 
      claimsBackendApi.updateClaimStatus(claimId, statusData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(claimsQueryKeys.detail(variables.claimId), data);
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update claim status');
    },
    ...options,
  });
};

/**
 * Mutation hook to add claim note
 */
export const useAddClaimNote = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, ...noteData }) => 
      claimsBackendApi.addNote(claimId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.notes(variables.claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(variables.claimId) });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add note');
    },
    ...options,
  });
};

/**
 * Mutation hook for bulk operations
 */
export const useBulkUpdateClaims = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, updateData }) => 
      claimsBackendApi.bulkUpdateClaims(claimIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update claims');
    },
    ...options,
  });
};

/**
 * Mutation hook for bulk assignment
 */
export const useBulkAssignClaims = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, assignedTo }) => 
      claimsBackendApi.bulkAssignClaims(claimIds, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign claims');
    },
    ...options,
  });
};

/**
 * Mutation hook for importing claims
 */
export const useImportClaims = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => claimsBackendApi.importClaims(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.stats() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import claims');
    },
    ...options,
  });
};

/**
 * Hook for exporting claims data
 */
export const useExportClaims = () => {
  return useMutation({
    mutationFn: (filters) => claimsBackendApi.exportClaims(filters),
    onError: (error) => {
      toast.error(error.message || 'Failed to export claims');
    },
  });
};

/**
 * Hook for downloading template
 */
export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: () => claimsBackendApi.downloadTemplate(),
    onError: (error) => {
      toast.error(error.message || 'Failed to download template');
    },
  });
};

// Helper hook for prefetching claim data
export const usePrefetchClaim = () => {
  const queryClient = useQueryClient();

  return (claimId) => {
    queryClient.prefetchQuery({
      queryKey: claimsQueryKeys.detail(claimId),
      queryFn: () => claimsBackendApi.getClaimById(claimId),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Helper hook for optimistic updates
export const useOptimisticClaimUpdate = () => {
  const queryClient = useQueryClient();

  return (claimId, updateFn) => {
    queryClient.setQueryData(claimsQueryKeys.detail(claimId), updateFn);
  };
};
