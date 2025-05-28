
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoicesApi } from '../services/api/invoicesApi';

/**
 * React Query hooks for invoices management
 * Provides optimistic updates and proper error handling
 * Optimized for MongoDB/Node.js/Express backend integration
 */

// Query keys for cache management
export const invoicesQueryKeys = {
  all: ['invoices'],
  lists: () => [...invoicesQueryKeys.all, 'list'],
  list: (params) => [...invoicesQueryKeys.lists(), params],
  details: () => [...invoicesQueryKeys.all, 'detail'],
  detail: (id) => [...invoicesQueryKeys.details(), id],
  stats: () => [...invoicesQueryKeys.all, 'stats'],
};

/**
 * Hook to fetch invoices with filtering and pagination
 */
export const useInvoices = (params = {}) => {
  return useQuery({
    queryKey: invoicesQueryKeys.list(params),
    queryFn: () => invoicesApi.getInvoices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we're in offline mode
      if (invoicesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching invoices:', error);
      if (!invoicesApi.isOfflineMode) {
        toast.error('Failed to load invoices - working offline with sample data');
      }
    },
  });
};

/**
 * Hook to fetch a single invoice by ID
 */
export const useInvoice = (invoiceId) => {
  return useQuery({
    queryKey: invoicesQueryKeys.detail(invoiceId),
    queryFn: () => invoicesApi.getInvoiceById(invoiceId),
    enabled: !!invoiceId, // Only run if invoiceId exists
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (invoicesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching invoice:', error);
      if (!invoicesApi.isOfflineMode) {
        toast.error('Failed to load invoice details');
      }
    },
  });
};

/**
 * Hook to create a new invoice
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceData) => {
      console.log('Creating invoice with data:', invoiceData);
      
      // Basic validation
      if (!invoiceData.clientName || !invoiceData.total) {
        throw new Error('Missing required fields: client name or total amount');
      }

      return invoicesApi.createInvoice(invoiceData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch invoices list
      queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.lists() });
      
      const mode = invoicesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Invoice "${data.invoice.invoiceNumber}" created successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing invoice
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      console.log('Updating invoice with data:', invoiceData);
      
      return invoicesApi.updateInvoice(id, invoiceData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Update specific invoice in cache
      queryClient.setQueryData(invoicesQueryKeys.detail(id), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.lists() });
      
      const mode = invoicesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Invoice "${data.invoice.invoiceNumber}" updated successfully${mode}`);
    },
    onError: (error, variables) => {
      console.error('Error updating invoice:', error);
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
};

/**
 * Hook to delete an invoice
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId) => invoicesApi.deleteInvoice(invoiceId),
    onSuccess: (data, invoiceId) => {
      // Remove invoice from cache
      queryClient.removeQueries({ queryKey: invoicesQueryKeys.detail(invoiceId) });
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.lists() });
      
      const mode = invoicesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Invoice deleted successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });
};

/**
 * Hook to send invoice via email
 */
export const useSendInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, emailData }) => invoicesApi.sendInvoice(invoiceId, emailData),
    onSuccess: (data, variables) => {
      const { invoiceId } = variables;
      
      // Update specific invoice in cache
      queryClient.setQueryData(invoicesQueryKeys.detail(invoiceId), data);
      
      // Invalidate lists to refresh them
      queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.lists() });
      
      const mode = invoicesApi.isOfflineMode ? ' (offline mode)' : '';
      toast.success(`Invoice sent successfully${mode}`);
    },
    onError: (error) => {
      console.error('Error sending invoice:', error);
      toast.error(`Failed to send invoice: ${error.message}`);
    },
  });
};

/**
 * Hook to get invoice statistics
 */
export const useInvoiceStats = (params = {}) => {
  return useQuery({
    queryKey: [...invoicesQueryKeys.stats(), params],
    queryFn: () => invoicesApi.getInvoiceStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (invoicesApi.isOfflineMode) return false;
      return failureCount < 2;
    },
    onError: (error) => {
      console.error('Error fetching invoice stats:', error);
      if (!invoicesApi.isOfflineMode) {
        toast.error('Failed to load invoice statistics');
      }
    },
  });
};
