
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesBackendApi } from '../services/api/policiesApiBackend';
import { toast } from 'sonner';

// Get all policies with filters
export const usePolicies = (params = {}) => {
  return useQuery({
    queryKey: ['policies', params],
    queryFn: () => policiesBackendApi.getPolicies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single policy by ID
export const usePolicy = (id) => {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: () => policiesBackendApi.getPolicyById(id),
    enabled: !!id,
  });
};

// Create policy mutation
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: policiesBackendApi.createPolicy,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy created successfully');
    },
    onError: (error) => {
      console.error('Create policy error:', error);
      toast.error(error.message || 'Failed to create policy');
    }
  });
};

// Update policy mutation
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, policyData }) => policiesBackendApi.updatePolicy(id, policyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy', variables.id] });
      toast.success('Policy updated successfully');
    },
    onError: (error) => {
      console.error('Update policy error:', error);
      toast.error(error.message || 'Failed to update policy');
    }
  });
};

// Delete policy mutation
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: policiesBackendApi.deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error) => {
      console.error('Delete policy error:', error);
      toast.error(error.message || 'Failed to delete policy');
    }
  });
};

// Search policies
export const useSearchPolicies = () => {
  return useMutation({
    mutationFn: ({ query, limit }) => policiesBackendApi.searchPolicies(query, limit),
  });
};

// Upload document mutation
export const useUploadPolicyDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, documentType, file, name }) => 
      policiesBackendApi.uploadDocument(policyId, documentType, file, name),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      queryClient.invalidateQueries({ queryKey: ['policyDocuments', variables.policyId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload document error:', error);
      toast.error(error.message || 'Failed to upload document');
    }
  });
};

// Get policy documents
export const usePolicyDocuments = (policyId) => {
  return useQuery({
    queryKey: ['policyDocuments', policyId],
    queryFn: () => policiesBackendApi.getPolicyDocuments(policyId),
    enabled: !!policyId,
  });
};

// Delete document mutation
export const useDeletePolicyDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, documentId }) => 
      policiesBackendApi.deleteDocument(policyId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      queryClient.invalidateQueries({ queryKey: ['policyDocuments', variables.policyId] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Delete document error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  });
};

// Add payment mutation
export const useAddPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, paymentData }) => 
      policiesBackendApi.addPayment(policyId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      queryClient.invalidateQueries({ queryKey: ['paymentHistory', variables.policyId] });
      toast.success('Payment record added successfully');
    },
    onError: (error) => {
      console.error('Add payment error:', error);
      toast.error(error.message || 'Failed to add payment record');
    }
  });
};

// Get payment history
export const usePaymentHistory = (policyId) => {
  return useQuery({
    queryKey: ['paymentHistory', policyId],
    queryFn: () => policiesBackendApi.getPaymentHistory(policyId),
    enabled: !!policyId,
  });
};

// Renew policy mutation
export const useRenewPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, renewalData }) => 
      policiesBackendApi.renewPolicy(policyId, renewalData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy renewed successfully');
    },
    onError: (error) => {
      console.error('Renew policy error:', error);
      toast.error(error.message || 'Failed to renew policy');
    }
  });
};

// Add note mutation
export const useAddPolicyNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, noteData }) => 
      policiesBackendApi.addNote(policyId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      queryClient.invalidateQueries({ queryKey: ['policyNotes', variables.policyId] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Add note error:', error);
      toast.error(error.message || 'Failed to add note');
    }
  });
};

// Get policy notes
export const usePolicyNotes = (policyId) => {
  return useQuery({
    queryKey: ['policyNotes', policyId],
    queryFn: () => policiesBackendApi.getPolicyNotes(policyId),
    enabled: !!policyId,
  });
};

// Get policy statistics
export const usePolicyStats = () => {
  return useQuery({
    queryKey: ['policyStats'],
    queryFn: policiesBackendApi.getPolicyStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get expiring policies
export const useExpiringPolicies = (days = 30) => {
  return useQuery({
    queryKey: ['expiringPolicies', days],
    queryFn: () => policiesBackendApi.getExpiringPolicies(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get policies due for renewal
export const usePoliciesDueForRenewal = (days = 30) => {
  return useQuery({
    queryKey: ['policiesDueForRenewal', days],
    queryFn: () => policiesBackendApi.getPoliciesDueForRenewal(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Export policies
export const useExportPolicies = () => {
  return useMutation({
    mutationFn: policiesBackendApi.exportPolicies,
    onSuccess: () => {
      toast.success('Policies exported successfully');
    },
    onError: (error) => {
      console.error('Export policies error:', error);
      toast.error(error.message || 'Failed to export policies');
    }
  });
};

// Assign policy to agent
export const useAssignPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, agentId }) => 
      policiesBackendApi.assignPolicyToAgent(policyId, agentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy', variables.policyId] });
      toast.success('Policy assigned successfully');
    },
    onError: (error) => {
      console.error('Assign policy error:', error);
      toast.error(error.message || 'Failed to assign policy');
    }
  });
};

// Bulk assign policies
export const useBulkAssignPolicies = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyIds, agentId }) => 
      policiesBackendApi.bulkAssignPolicies(policyIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policies assigned successfully');
    },
    onError: (error) => {
      console.error('Bulk assign policies error:', error);
      toast.error(error.message || 'Failed to assign policies');
    }
  });
};
