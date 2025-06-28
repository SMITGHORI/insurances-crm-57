
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/services/api/quotationsApi';
import { toast } from 'sonner';

// Fetch quotes for a specific lead
export const useQuotes = (leadId: string) => {
  return useQuery({
    queryKey: ['quotes', leadId],
    queryFn: () => quotationsApi.getQuotations({ clientId: leadId }),
    enabled: !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch single quote by ID
export const useQuoteById = (quoteId: string | null) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotationsApi.getQuotationById(quoteId!),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create new quote
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteData: FormData) => quotationsApi.createQuotation(quoteData),
    onSuccess: (data, variables) => {
      // Extract leadId from FormData
      const leadId = variables.get('leadId') as string;
      
      // Invalidate and refetch quotes for this lead
      queryClient.invalidateQueries({ queryKey: ['quotes', leadId] });
      
      toast.success('Quote created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create quote:', error);
      toast.error(error.message || 'Failed to create quote');
    },
  });
};

// Update quote status
export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, status, additionalData }: { 
      quoteId: string; 
      status: string; 
      additionalData?: any 
    }) => quotationsApi.updateQuotationStatus(quoteId, status, additionalData),
    onSuccess: (data) => {
      // Invalidate all quote-related queries
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      
      toast.success('Quote status updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update quote status:', error);
      toast.error(error.message || 'Failed to update quote status');
    },
  });
};

// Export quotes to CSV
export const useExportQuotes = () => {
  return useMutation({
    mutationFn: (quotes: any[]) => {
      // Generate CSV content
      const headers = ['Carrier', 'Premium', 'Coverage', 'Value Score', 'Valid Until', 'Status'];
      const csvContent = [
        headers.join(','),
        ...quotes.map(quote => [
          quote.carrier,
          quote.premium,
          quote.coverageAmount,
          quote.valueScore || (quote.coverageAmount / quote.premium),
          quote.validUntil,
          quote.status
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `quotes-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Quotes exported successfully');
    },
    onError: (error: any) => {
      console.error('Failed to export quotes:', error);
      toast.error('Failed to export quotes');
    },
  });
};

// Send quote via email
export const useSendQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, emailData }: { quoteId: string; emailData: any }) => 
      quotationsApi.sendQuotation(quoteId, emailData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote sent successfully');
    },
    onError: (error: any) => {
      console.error('Failed to send quote:', error);
      toast.error(error.message || 'Failed to send quote');
    },
  });
};

// Get quote statistics
export const useQuoteStats = (params?: any) => {
  return useQuery({
    queryKey: ['quote-stats', params],
    queryFn: () => quotationsApi.getQuotationsStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
