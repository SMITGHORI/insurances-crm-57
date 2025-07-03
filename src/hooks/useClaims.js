
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { claimsApi } from '../services/api/claimsApi';

/**
 * React Query hooks for claims management with MongoDB integration
 * Provides optimistic updates and proper error handling
 * Integrates with Node.js/Express/MongoDB backend
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
  timeline: (id) => [...claimsQueryKeys.detail(id), 'timeline'],
  stats: () => [...claimsQueryKeys.all, 'stats'],
  dashboardStats: () => [...claimsQueryKeys.stats(), 'dashboard'],
  search: (query) => [...claimsQueryKeys.all, 'search', query],
  formData: () => [...claimsQueryKeys.all, 'formData'],
  policies: () => [...claimsQueryKeys.formData(), 'policies'],
  clients: () => [...claimsQueryKeys.formData(), 'clients'],
};

/**
 * Hook to fetch claims with filtering and pagination
 */
export const useClaims = (params = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.list(params),
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims from database');
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
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim:', error);
      toast.error('Failed to load claim details from database');
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
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim created successfully in MongoDB:', data);
    },
    onError: (error, variables) => {
      console.error('Error creating claim in MongoDB:', error);
      toast.error(`Failed to create claim in database: ${error.message}`);
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
      
      console.log('Claim updated successfully in MongoDB:', data);
    },
    onError: (error, variables) => {
      console.error('Error updating claim in MongoDB:', error);
      toast.error(`Failed to update claim in database: ${error.message}`);
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
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim deleted successfully from MongoDB');
    },
    onError: (error) => {
      console.error('Error deleting claim from MongoDB:', error);
      toast.error(`Failed to delete claim from database: ${error.message}`);
    },
  });
};

/**
 * Hook to upload claim document
 */
export const useUploadClaimDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file, name }) => 
      claimsApi.uploadDocument(claimId, documentType, file, name),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      
      // Invalidate claim details to refresh document count
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      
      console.log('Document uploaded successfully to MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error uploading document to MongoDB:', error);
      toast.error(`Failed to upload document to database: ${error.message}`);
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
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim documents from MongoDB:', error);
      toast.error('Failed to load claim documents from database');
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
      
      console.log('Document deleted successfully from MongoDB');
    },
    onError: (error) => {
      console.error('Error deleting document from MongoDB:', error);
      toast.error(`Failed to delete document from database: ${error.message}`);
    },
  });
};

/**
 * Hook to update claim status
 */
export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, status, reason, approvedAmount }) => 
      claimsApi.updateClaimStatus(claimId, status, reason, approvedAmount),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      
      // Update specific claim in cache
      queryClient.setQueryData(claimsQueryKeys.detail(claimId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claim status updated successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error updating claim status in MongoDB:', error);
      toast.error(`Failed to update claim status in database: ${error.message}`);
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
      
      console.log('Note added successfully to MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error adding note to MongoDB:', error);
      toast.error(`Failed to add note to database: ${error.message}`);
    },
  });
};

/**
 * Hook to get claim notes
 */
export const useClaimNotes = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.notes(claimId),
    queryFn: () => claimsApi.getClaimNotes(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim notes from MongoDB:', error);
      toast.error('Failed to load claim notes from database');
    },
  });
};

/**
 * Hook to search claims
 */
export const useSearchClaims = (query, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.search(query),
    queryFn: () => claimsApi.searchClaims(query, options.limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error) => {
      console.error('Error searching claims in MongoDB:', error);
      toast.error('Failed to search claims in database');
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
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claims stats from MongoDB:', error);
      toast.error('Failed to load claims statistics from database');
    },
  });
};

/**
 * Hook to get dashboard statistics
 */
export const useClaimsDashboardStats = () => {
  return useQuery({
    queryKey: claimsQueryKeys.dashboardStats(),
    queryFn: () => claimsApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching dashboard stats from MongoDB:', error);
      toast.error('Failed to load dashboard statistics from database');
    },
  });
};

/**
 * Hook to bulk update claims
 */
export const useBulkUpdateClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, updateData }) => 
      claimsApi.bulkUpdateClaims(claimIds, updateData),
    onSuccess: (data, variables) => {
      // Invalidate all claims lists
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claims bulk updated successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error bulk updating claims in MongoDB:', error);
      toast.error(`Failed to update claims in database: ${error.message}`);
    },
  });
};

/**
 * Hook to bulk assign claims
 */
export const useBulkAssignClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, agentId }) => 
      claimsApi.bulkAssignClaims(claimIds, agentId),
    onSuccess: (data, variables) => {
      // Invalidate all claims lists
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      
      console.log('Claims bulk assigned successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error bulk assigning claims in MongoDB:', error);
      toast.error(`Failed to assign claims in database: ${error.message}`);
    },
  });
};

/**
 * Hook to export claims data
 */
export const useExportClaims = () => {
  return useMutation({
    mutationFn: (filters) => claimsApi.exportClaims(filters),
    onSuccess: (data) => {
      console.log('Claims exported successfully from MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error exporting claims from MongoDB:', error);
      toast.error(`Failed to export claims from database: ${error.message}`);
    },
  });
};

/**
 * Hook to get policies for claim form
 */
export const usePoliciesForClaim = () => {
  return useQuery({
    queryKey: claimsQueryKeys.policies(),
    queryFn: () => claimsApi.getPoliciesForClaim(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policies for claim from MongoDB:', error);
      toast.error('Failed to load policies from database');
    },
  });
};

/**
 * Hook to get clients for claim form
 */
export const useClientsForClaim = () => {
  return useQuery({
    queryKey: claimsQueryKeys.clients(),
    queryFn: () => claimsApi.getClientsForClaim(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching clients for claim from MongoDB:', error);
      toast.error('Failed to load clients from database');
    },
  });
};

/**
 * Hook to get policy details for claim
 */
export const usePolicyDetailsForClaim = (policyId) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.formData(), 'policy', policyId],
    queryFn: () => claimsApi.getPolicyDetails(policyId),
    enabled: !!policyId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy details for claim from MongoDB:', error);
      toast.error('Failed to load policy details from database');
    },
  });
};
