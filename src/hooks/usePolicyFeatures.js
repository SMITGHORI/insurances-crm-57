import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { policiesBackendApi } from '../services/api/policiesApiBackend';
import { policiesQueryKeys } from './usePolicies';

/**
 * Additional policy feature hooks for MongoDB operations
 */

/**
 * Hook for policy search functionality
 */
export const usePolicySearch = () => {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }) => {
      console.log('Searching policies in MongoDB:', { query, limit });
      const result = await policiesBackendApi.searchPolicies(query, limit);
      console.log('Policy search results from MongoDB:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error searching policies in MongoDB:', error);
      toast.error(`Search failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting policies by agent
 */
export const usePoliciesByAgent = (agentId) => {
  return useQuery({
    queryKey: ['policies', 'agent', agentId],
    queryFn: async () => {
      console.log('Fetching policies by agent from MongoDB:', agentId);
      const result = await policiesBackendApi.getPoliciesByAgent(agentId);
      console.log('Agent policies fetched from MongoDB:', result);
      return result;
    },
    enabled: !!agentId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching agent policies from MongoDB:', error);
      toast.error(`Failed to load agent policies: ${error.message}`);
    },
  });
};

/**
 * Hook for assigning policies to agents
 */
export const useAssignPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ policyId, agentId }) => {
      console.log('Assigning policy to agent in MongoDB:', { policyId, agentId });
      const result = await policiesBackendApi.assignPolicyToAgent(policyId, agentId);
      console.log('Policy assigned to agent in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { policyId, agentId } = variables;
      console.log('Policy successfully assigned to agent in MongoDB:', data);
      
      // Invalidate relevant queries to refresh data from database
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(policyId) });
      queryClient.invalidateQueries({ queryKey: ['policies', 'agent', agentId] });
      
      toast.success('Policy assigned successfully to agent in database');
    },
    onError: (error) => {
      console.error('Error assigning policy to agent in MongoDB:', error);
      toast.error(`Failed to assign policy: ${error.message}`);
    },
  });
};

/**
 * Hook for policy statistics from MongoDB
 */
export const usePolicyStats = () => {
  return useQuery({
    queryKey: policiesQueryKeys.stats(),
    queryFn: async () => {
      console.log('Fetching policy statistics from MongoDB');
      const result = await policiesBackendApi.getPolicyStats();
      console.log('Policy statistics fetched from MongoDB:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy stats from MongoDB:', error);
      toast.error(`Failed to load policy statistics: ${error.message}`);
    },
  });
};

/**
 * Hook for policy documents from MongoDB
 */
export const usePolicyDocuments = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.documents(policyId),
    queryFn: async () => {
      console.log('Fetching policy documents from MongoDB:', policyId);
      const result = await policiesBackendApi.getPolicyDocuments(policyId);
      console.log('Policy documents fetched from MongoDB:', result);
      return result;
    },
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('Error fetching policy documents from MongoDB:', error);
      toast.error(`Failed to load policy documents: ${error.message}`);
    },
  });
};

/**
 * Hook for uploading policy documents to MongoDB
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, documentType, file, name }) => 
      policiesBackendApi.uploadDocument(policyId, documentType, file, name),
    onSuccess: (data, variables) => {
      console.log('Document successfully uploaded to MongoDB:', data);
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.documents(variables.policyId) });
      toast.success('Document uploaded successfully to database');
    },
    onError: (error) => {
      console.error('Error uploading document to MongoDB:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

/**
 * Hook for policy payment history from MongoDB
 */
export const usePolicyPayments = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.payments(policyId),
    queryFn: async () => {
      console.log('Fetching payment history from MongoDB:', policyId);
      const result = await policiesBackendApi.getPaymentHistory(policyId);
      console.log('Payment history fetched from MongoDB:', result);
      return result;
    },
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching payment history from MongoDB:', error);
      toast.error(`Failed to load payment history: ${error.message}`);
    },
  });
};

/**
 * Hook for adding payment records to MongoDB
 */
export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, paymentData }) => 
      policiesBackendApi.addPayment(policyId, paymentData),
    onSuccess: (data, variables) => {
      console.log('Payment successfully added to MongoDB:', data);
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.payments(variables.policyId) });
      toast.success('Payment record added successfully to database');
    },
    onError: (error) => {
      console.error('Error adding payment to MongoDB:', error);
      toast.error(`Failed to add payment: ${error.message}`);
    },
  });
};

/**
 * Hook for policy notes from MongoDB
 */
export const usePolicyNotes = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.notes(policyId),
    queryFn: async () => {
      console.log('Fetching policy notes from MongoDB:', policyId);
      const result = await policiesBackendApi.getPolicyNotes(policyId);
      console.log('Policy notes fetched from MongoDB:', result);
      return result;
    },
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching policy notes from MongoDB:', error);
      toast.error(`Failed to load policy notes: ${error.message}`);
    },
  });
};

/**
 * Hook for adding policy notes to MongoDB
 */
export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, noteData }) => 
      policiesBackendApi.addNote(policyId, noteData),
    onSuccess: (data, variables) => {
      console.log('Note successfully added to MongoDB:', data);
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.notes(variables.policyId) });
      toast.success('Note added successfully to database');
    },
    onError: (error) => {
      console.error('Error adding note to MongoDB:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook for policy renewal in MongoDB
 */
export const useRenewPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, renewalData }) => 
      policiesBackendApi.renewPolicy(policyId, renewalData),
    onSuccess: (data, variables) => {
      console.log('Policy successfully renewed in MongoDB:', data);
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      toast.success('Policy renewed successfully in database');
    },
    onError: (error) => {
      console.error('Error renewing policy in MongoDB:', error);
      toast.error(`Failed to renew policy: ${error.message}`);
    },
  });
};

/**
 * Hook for expiring policies from MongoDB
 */
export const useExpiringPolicies = (days = 30) => {
  return useQuery({
    queryKey: ['expiringPolicies', days],
    queryFn: async () => {
      console.log('Fetching expiring policies from MongoDB:', days);
      const result = await policiesBackendApi.getExpiringPolicies(days);
      console.log('Expiring policies fetched from MongoDB:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching expiring policies from MongoDB:', error);
      toast.error(`Failed to load expiring policies: ${error.message}`);
    },
  });
};

/**
 * Hook for policies due for renewal from MongoDB
 */
export const usePoliciesDueForRenewal = (days = 30) => {
  return useQuery({
    queryKey: ['policiesDueForRenewal', days],
    queryFn: async () => {
      console.log('Fetching policies due for renewal from MongoDB:', days);
      const result = await policiesBackendApi.getPoliciesDueForRenewal(days);
      console.log('Policies due for renewal fetched from MongoDB:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching policies due for renewal from MongoDB:', error);
      toast.error(`Failed to load policies due for renewal: ${error.message}`);
    },
  });
};

/**
 * Hook for bulk policy operations in MongoDB
 */
export const useBulkPolicyOperations = () => {
  const queryClient = useQueryClient();

  const bulkAssignMutation = useMutation({
    mutationFn: ({ policyIds, agentId }) => 
      policiesBackendApi.bulkAssignPolicies(policyIds, agentId),
    onSuccess: () => {
      console.log('Bulk assign successfully completed in MongoDB');
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.lists() });
      toast.success('Policies assigned successfully in database');
    },
    onError: (error) => {
      console.error('Error bulk assigning policies in MongoDB:', error);
      toast.error(`Failed to assign policies: ${error.message}`);
    },
  });

  return {
    bulkAssign: bulkAssignMutation.mutateAsync,
    isLoading: bulkAssignMutation.isLoading,
  };
};

/**
 * Hook for policy export from MongoDB
 */
export const usePolicyExport = () => {
  return useMutation({
    mutationFn: (exportData) => policiesBackendApi.exportPolicies(exportData),
    onSuccess: (data) => {
      console.log('Policy export successfully completed from MongoDB');
      
      // Handle download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `policies-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export completed successfully from database');
    },
    onError: (error) => {
      console.error('Error exporting policies from MongoDB:', error);
      toast.error(`Export failed: ${error.message}`);
    },
  });
};
