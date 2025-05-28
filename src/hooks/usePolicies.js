
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { policiesApi } from '../services/api/policiesApi';

/**
 * React Query hooks for policy management
 * Provides optimistic updates and proper error handling
 * Works with both backend API and offline mock data
 */

// Query keys for cache management
export const policiesQueryKeys = {
  all: ['policies'],
  lists: () => [...policiesQueryKeys.all, 'list'],
  list: (params) => [...policiesQueryKeys.lists(), params],
  details: () => [...policiesQueryKeys.all, 'detail'],
  detail: (id) => [...policiesQueryKeys.details(), id],
};

/**
 * Hook to fetch policies with filtering and pagination
 */
export const usePolicies = (params = {}) => {
  return useQuery({
    queryKey: policiesQueryKeys.list(params),
    queryFn: () => policiesApi.getPolicies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (policiesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching policies:', error);
      if (!policiesApi.isOfflineMode) {
        toast.error('Failed to load policies - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single policy by ID
 */
export const usePolicy = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.detail(policyId),
    queryFn: () => policiesApi.getPolicyById(policyId),
    enabled: !!policyId, // Only run if policyId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (policiesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching policy:', error);
      if (!policiesApi.isOfflineMode) {
        toast.error('Failed to load policy details');
      }
    },
  });
};

/**
 * Hook to create a new policy
 */
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyData) => {
      console.log('Creating policy with data:', policyData);
      
      // Basic validation
      if (!policyData.client?.id || !policyData.type || !policyData.premium || !policyData.sumAssured) {
        throw new Error('Missing required fields: client, type, premium, or sum assured');
      }

      return policiesApi.createPolicy(policyData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch policies list
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      
      const mode = policiesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Policy "${data.policyNumber}" created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating policy:', error);
      toast.error(`Failed to create policy: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing policy
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, policyData }) => {
      console.log('Updating policy with data:', policyData);
      
      // Basic validation
      if (!policyData.client?.id || !policyData.type || !policyData.premium || !policyData.sumAssured) {
        throw new Error('Missing required fields: client, type, premium, or sum assured');
      }

      return policiesApi.updatePolicy(id, policyData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific policy in cache
      queryClient.setQueryData(policiesQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      
      const mode = policiesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Policy "${data.policyNumber}" updated successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error updating policy:', error);
      toast.error(`Failed to update policy: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a policy
 */
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId) => policiesApi.deletePolicy(policyId),
    onSuccess: (data, policyId) => {
      // Remove policy from cache
      queryClient.removeQueries({ queryKey: policiesQueryKeys.detail(policyId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      
      const mode = policiesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Policy deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting policy:', error);
      toast.error(`Failed to delete policy: ${error.message}`);
    },
  });
};
