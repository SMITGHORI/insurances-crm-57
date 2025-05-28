
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quotationsApi } from '../services/api/quotationsApi';

/**
 * React Query hooks for quotations management
 * Provides optimistic updates and proper error handling
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Query keys for cache management
export const quotationsQueryKeys = {
  all: ['quotations'],
  lists: () => [...quotationsQueryKeys.all, 'list'],
  list: (params) => [...quotationsQueryKeys.lists(), params],
  details: () => [...quotationsQueryKeys.all, 'detail'],
  detail: (id) => [...quotationsQueryKeys.details(), id],
  stats: () => [...quotationsQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch quotations with filtering and pagination
 */
export const useQuotations = (params = {}) => {
  return useQuery({
    queryKey: quotationsQueryKeys.list(params),
    queryFn: () => quotationsApi.getQuotations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (quotationsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching quotations:', error);
      if (!quotationsApi.isOfflineMode) {
        toast.error('Failed to load quotations - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single quotation by ID
 */
export const useQuotation = (quotationId) => {
  return useQuery({
    queryKey: quotationsQueryKeys.detail(quotationId),
    queryFn: () => quotationsApi.getQuotationById(quotationId),
    enabled: !!quotationId, // Only run if quotationId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (quotationsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching quotation:', error);
      if (!quotationsApi.isOfflineMode) {
        toast.error('Failed to load quotation details');
      }
    },
  });
};

/**
 * Hook to create a new quotation
 */
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationData) => {
      console.log('Creating quotation with data:', quotationData);
      
      // Basic validation
      if (!quotationData.clientName || !quotationData.insuranceType || !quotationData.premium) {
        throw new Error('Missing required fields: client name, insurance type, or premium');
      }

      return quotationsApi.createQuotation(quotationData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch quotations list
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      
      const mode = quotationsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Quotation "${data.quoteId}" created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating quotation:', error);
      toast.error(`Failed to create quotation: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing quotation
 */
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quotationData }) => {
      console.log('Updating quotation with data:', quotationData);
      
      return quotationsApi.updateQuotation(id, quotationData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific quotation in cache
      queryClient.setQueryData(quotationsQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      
      const mode = quotationsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Quotation "${data.quoteId}" updated successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error updating quotation:', error);
      toast.error(`Failed to update quotation: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a quotation
 */
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quotationId) => quotationsApi.deleteQuotation(quotationId),
    onSuccess: (data, quotationId) => {
      // Remove quotation from cache
      queryClient.removeQueries({ queryKey: quotationsQueryKeys.detail(quotationId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      
      const mode = quotationsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Quotation deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting quotation:', error);
      toast.error(`Failed to delete quotation: ${error.message}`);
    },
  });
};

/**
 * Hook to send quotation via email
 */
export const useSendQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, emailData }) => quotationsApi.sendQuotation(quotationId, emailData),
    onSuccess: (data, variables) => {
      const { quotationId } = variables;
      
      // Update specific quotation in cache
      queryClient.setQueryData(quotationsQueryKeys.detail(quotationId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      
      const mode = quotationsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Quotation sent successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error sending quotation:', error);
      toast.error(`Failed to send quotation: ${error.message}`);
    },
  });
};

/**
 * Hook to update quotation status
 */
export const useUpdateQuotationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, status, additionalData }) => 
      quotationsApi.updateQuotationStatus(quotationId, status, additionalData),
    onSuccess: (data, variables) => {
      const { quotationId } = variables;
      
      // Update specific quotation in cache
      queryClient.setQueryData(quotationsQueryKeys.detail(quotationId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      
      const mode = quotationsApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Quotation status updated successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error updating quotation status:', error);
      toast.error(`Failed to update quotation status: ${error.message}`);
    },
  });
};

/**
 * Hook to get quotations statistics
 */
export const useQuotationsStats = (params = {}) => {
  return useQuery({
    queryKey: [...quotationsQueryKeys.stats(), params],
    queryFn: () => quotationsApi.getQuotationsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (quotationsApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching quotations stats:', error);
      if (!quotationsApi.isOfflineMode) {
        toast.error('Failed to load quotations statistics');
      }
    },
  });
};
