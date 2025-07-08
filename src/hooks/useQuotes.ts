import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import quotationsApi from '../services/api/quotationsApi';

// Define Quote interface for TypeScript
export interface Quote {
  id: string;
  quoteId: string;
  leadId: string;
  leadName: string;
  carrier: string;
  premium: number;
  coverageAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  branch?: string;
  agentId?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  whatsappSent?: boolean;
  emailSent?: boolean;
}

export const useQuotes = (params?: {
  status?: string;
  branch?: string;
  agentId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: async () => {
      const response = await quotationsApi.getQuotations(params);
      return response.data || response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useQuoteById = (quoteId: string | null) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      const response = await quotationsApi.getQuotationById(quoteId);
      return response.data || response;
    },
    enabled: !!quoteId,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationData: any) => {
      const response = await quotationsApi.createQuotation(quotationData);
      return response.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create quote');
    },
  });
};

export const useExportQuotes = () => {
  return useMutation({
    mutationFn: async (exportParams: any) => {
      const response = await quotationsApi.export(exportParams);
      return response.data || response;
    },
    onSuccess: () => {
      toast.success('Quotes exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export quotes');
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, status, additionalData }: { quoteId: string; status: string; additionalData?: any }) =>
      quotationsApi.updateQuotationStatus(quoteId, status, additionalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quote status');
    },
  });
};

export const useSendWhatsApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, message }: { quoteIds: string[]; message: string }) => {
      // Send WhatsApp for each quote
      const promises = quoteIds.map(quoteId => 
        quotationsApi.makeRequest(`/${quoteId}/whatsapp`, {
          method: 'POST',
          body: JSON.stringify({ message })
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('WhatsApp messages sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send WhatsApp messages');
    },
  });
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, template }: { quoteIds: string[]; template: string }) => {
      // Send email for each quote
      const promises = quoteIds.map(quoteId => 
        quotationsApi.sendQuotation(quoteId, { template })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Emails sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send emails');
    },
  });
};

export const useBulkUpdateQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteIds, status }: { quoteIds: string[]; status: string }) => {
      // Bulk update quotes status
      const promises = quoteIds.map(quoteId => 
        quotationsApi.updateQuotationStatus(quoteId, status)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quotes updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quotes');
    },
  });
};
