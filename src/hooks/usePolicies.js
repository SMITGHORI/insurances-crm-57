
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { policiesApi } from '../services/api/policiesApi';

/**
 * React Query hooks for policy management with MongoDB integration
 * All operations connect directly to the database
 */

// Query keys for cache management
export const policiesQueryKeys = {
  all: ['policies'],
  lists: () => [...policiesQueryKeys.all, 'list'],
  list: (params) => [...policiesQueryKeys.lists(), params],
  details: () => [...policiesQueryKeys.all, 'detail'],
  detail: (id) => [...policiesQueryKeys.details(), id],
  documents: (id) => [...policiesQueryKeys.all, 'documents', id],
  payments: (id) => [...policiesQueryKeys.all, 'payments', id],
  notes: (id) => [...policiesQueryKeys.all, 'notes', id],
  stats: () => [...policiesQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch policies from MongoDB with filtering and pagination
 */
export const usePolicies = (params = {}) => {
  return useQuery({
    queryKey: policiesQueryKeys.list(params),
    queryFn: async () => {
      console.log('Fetching policies from MongoDB with params:', params);
      const result = await policiesApi.getPolicies(params);
      console.log('Policies fetched from MongoDB:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    onError: (error) => {
      console.error('Error fetching policies from MongoDB:', error);
      toast.error(`Failed to load policies: ${error.message}`);
    },
    onSuccess: (data) => {
      console.log('Successfully loaded policies from MongoDB:', data);
    }
  });
};

/**
 * Hook to fetch a single policy from MongoDB by ID
 */
export const usePolicy = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.detail(policyId),
    queryFn: async () => {
      console.log('Fetching policy from MongoDB:', policyId);
      const result = await policiesApi.getPolicyById(policyId);
      console.log('Policy fetched from MongoDB:', result);
      return result;
    },
    enabled: !!policyId,
    staleTime: 30 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy from MongoDB:', error);
      toast.error(`Failed to load policy: ${error.message}`);
    },
  });
};

/**
 * Hook to create a new policy in MongoDB
 */
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyData) => {
      console.log('Creating policy in MongoDB:', policyData);
      
      // Basic validation
      if (!policyData.client?.id || !policyData.type || !policyData.premium || !policyData.sumAssured) {
        throw new Error('Missing required fields: client, type, premium, or sum assured');
      }

      const result = await policiesApi.createPolicy(policyData);
      console.log('Policy created in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('Policy successfully created in MongoDB:', data);
      
      // Invalidate and refetch policies list to get fresh data from database
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
      
      toast.success(`Policy "${data.policyNumber}" created successfully in database`);
    },
    onError: (error, variables) => {
      console.error('Error creating policy in MongoDB:', error);
      toast.error(`Failed to create policy: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing policy in MongoDB
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, policyData }) => {
      console.log('Updating policy in MongoDB:', { id, policyData });
      
      // Basic validation
      if (!policyData.client?.id || !policyData.type || !policyData.premium || !policyData.sumAssured) {
        throw new Error('Missing required fields: client, type, premium, or sum assured');
      }

      const result = await policiesApi.updatePolicy(id, policyData);
      console.log('Policy updated in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      console.log('Policy successfully updated in MongoDB:', data);
      
      // Update specific policy in cache
      queryClient.setQueryData(policiesQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them with database data
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
      
      toast.success(`Policy "${data.policyNumber}" updated successfully in database`);
    },
    onError: (error, variables) => {
      console.error('Error updating policy in MongoDB:', error);
      toast.error(`Failed to update policy: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a policy from MongoDB
 */
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId) => {
      console.log('Deleting policy from MongoDB:', policyId);
      const result = await policiesApi.deletePolicy(policyId);
      console.log('Policy deleted from MongoDB:', result);
      return result;
    },
    onSuccess: (data, policyId) => {
      console.log('Policy successfully deleted from MongoDB:', policyId);
      
      // Remove policy from cache
      queryClient.removeQueries({ queryKey: policiesQueryKeys.detail(policyId) });
      
      // Invalidate lists to refresh them with database data
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
      
      toast.success('Policy deleted successfully from database');
    },
    onError: (error) => {
      console.error('Error deleting policy from MongoDB:', error);
      toast.error(`Failed to delete policy: ${error.message}`);
    },
  });
};

/**
 * Hook to upload policy documents to MongoDB
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ policyId, documentType, file, name }) => {
      console.log('Uploading document to MongoDB:', { policyId, documentType, fileName: file.name });
      const result = await policiesApi.uploadDocument(policyId, documentType, file, name);
      console.log('Document uploaded to MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { policyId, documentType } = variables;
      console.log('Document successfully uploaded to MongoDB:', data);
      
      // Invalidate policy documents cache to fetch fresh data from database
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.documents(policyId) });
      
      // Also invalidate policy details to refresh document list
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(policyId) });
      
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully to database`);
    },
    onError: (error, variables) => {
      console.error('Error uploading document to MongoDB:', error);
      const { documentType } = variables;
      toast.error(`Failed to upload ${documentType} document: ${error.message}`);
    },
  });
};

/**
 * Hook to fetch policy documents from MongoDB
 */
export const usePolicyDocuments = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.documents(policyId),
    queryFn: async () => {
      console.log('Fetching policy documents from MongoDB:', policyId);
      const result = await policiesApi.getPolicyDocuments(policyId);
      console.log('Policy documents fetched from MongoDB:', result);
      return result;
    },
    enabled: !!policyId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching policy documents from MongoDB:', error);
      toast.error(`Failed to load policy documents: ${error.message}`);
    },
  });
};

/**
 * Hook to delete policy document from MongoDB
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ policyId, documentId }) => {
      console.log('Deleting document from MongoDB:', { policyId, documentId });
      const result = await policiesApi.deleteDocument(policyId, documentId);
      console.log('Document deleted from MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { policyId } = variables;
      console.log('Document successfully deleted from MongoDB:', data);
      
      // Invalidate policy documents cache to fetch fresh data from database
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.documents(policyId) });
      
      toast.success('Document deleted successfully from database');
    },
    onError: (error) => {
      console.error('Error deleting document from MongoDB:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

/**
 * Hook to get policy statistics from MongoDB
 */
export const usePolicyStats = () => {
  return useQuery({
    queryKey: policiesQueryKeys.stats(),
    queryFn: async () => {
      console.log('Fetching policy statistics from MongoDB');
      const result = await policiesApi.getPolicyStats();
      console.log('Policy statistics fetched from MongoDB:', result);
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy statistics from MongoDB:', error);
      toast.error(`Failed to load policy statistics: ${error.message}`);
    },
  });
};

/**
 * Hook for bulk policy operations
 */
export const useBulkPolicyOperations = () => {
  const queryClient = useQueryClient();

  const bulkUpdate = useMutation({
    mutationFn: async ({ policyIds, updateData }) => {
      console.log('Bulk updating policies in MongoDB:', { policyIds, updateData });
      const result = await policiesApi.bulkUpdatePolicies(policyIds, updateData);
      console.log('Bulk update completed in MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bulk update successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error in bulk update in MongoDB:', error);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (policyIds) => {
      console.log('Bulk deleting policies from MongoDB:', policyIds);
      const result = await policiesApi.bulkDeletePolicies(policyIds);
      console.log('Bulk delete completed in MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bulk delete successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
    },
    onError: (error) => {
      console.error('Error in bulk delete in MongoDB:', error);
    },
  });

  const bulkAssign = useMutation({
    mutationFn: async ({ policyIds, agentId }) => {
      console.log('Bulk assigning policies in MongoDB:', { policyIds, agentId });
      const result = await policiesApi.bulkAssignPolicies(policyIds, agentId);
      console.log('Bulk assign completed in MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Bulk assign successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.stats() });
      toast.success('Policies assigned successfully in database');
    },
    onError: (error) => {
      console.error('Error in bulk assign in MongoDB:', error);
      toast.error(`Failed to assign policies: ${error.message}`);
    },
  });

  return {
    bulkUpdate,
    bulkDelete,
    bulkAssign,
  };
};

/**
 * Hook for policy export from MongoDB
 */
export const usePolicyExport = () => {
  return useMutation({
    mutationFn: async (exportData) => {
      console.log('Exporting policies from MongoDB:', exportData);
      const result = await policiesApi.exportPolicies(exportData);
      console.log('Policy export completed from MongoDB:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Policy export successfully completed from MongoDB');
      toast.success('Policies exported successfully from database');
    },
    onError: (error) => {
      console.error('Error exporting policies from MongoDB:', error);
      toast.error(`Failed to export policies: ${error.message}`);
    },
  });
};
