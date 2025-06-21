
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { policiesBackendApi } from '../services/api/policiesApiBackend';

/**
 * Hook for policy statistics
 */
export const usePolicyStats = () => {
  return useQuery({
    queryKey: ['policyStats'],
    queryFn: () => policiesBackendApi.getPolicyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy stats:', error);
    },
  });
};

/**
 * Hook for policy documents
 */
export const usePolicyDocuments = (policyId) => {
  return useQuery({
    queryKey: ['policyDocuments', policyId],
    queryFn: () => policiesBackendApi.getPolicyDocuments(policyId),
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for uploading policy documents
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, documentType, file, name }) => 
      policiesBackendApi.uploadDocument(policyId, documentType, file, name),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policyDocuments', variables.policyId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

/**
 * Hook for policy payment history
 */
export const usePolicyPayments = (policyId) => {
  return useQuery({
    queryKey: ['policyPayments', policyId],
    queryFn: () => policiesBackendApi.getPaymentHistory(policyId),
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for adding payment records
 */
export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, paymentData }) => 
      policiesBackendApi.addPayment(policyId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policyPayments', variables.policyId] });
      toast.success('Payment record added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add payment: ${error.message}`);
    },
  });
};

/**
 * Hook for policy notes
 */
export const usePolicyNotes = (policyId) => {
  return useQuery({
    queryKey: ['policyNotes', policyId],
    queryFn: () => policiesBackendApi.getPolicyNotes(policyId),
    enabled: !!policyId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for adding policy notes
 */
export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, noteData }) => 
      policiesBackendApi.addNote(policyId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policyNotes', variables.policyId] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook for policy renewal
 */
export const useRenewPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, renewalData }) => 
      policiesBackendApi.renewPolicy(policyId, renewalData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      toast.success('Policy renewed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to renew policy: ${error.message}`);
    },
  });
};

/**
 * Hook for expiring policies
 */
export const useExpiringPolicies = (days = 30) => {
  return useQuery({
    queryKey: ['expiringPolicies', days],
    queryFn: () => policiesBackendApi.getExpiringPolicies(days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for policies due for renewal
 */
export const usePoliciesDueForRenewal = (days = 30) => {
  return useQuery({
    queryKey: ['policiesDueForRenewal', days],
    queryFn: () => policiesBackendApi.getPoliciesDueForRenewal(days),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for bulk policy operations
 */
export const useBulkPolicyOperations = () => {
  const queryClient = useQueryClient();

  const bulkAssignMutation = useMutation({
    mutationFn: ({ policyIds, agentId }) => 
      policiesBackendApi.bulkAssignPolicies(policyIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policies assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign policies: ${error.message}`);
    },
  });

  return {
    bulkAssign: bulkAssignMutation.mutateAsync,
    isLoading: bulkAssignMutation.isLoading,
  };
};

/**
 * Hook for policy export
 */
export const usePolicyExport = () => {
  return useMutation({
    mutationFn: (exportData) => policiesBackendApi.exportPolicies(exportData),
    onSuccess: (data) => {
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
      
      toast.success('Export completed successfully');
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });
};
