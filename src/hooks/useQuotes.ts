
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockQuotes, Quote } from '@/__mocks__/quotes';
import { toast } from 'sonner';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const quotesApi = {
  getQuotes: async (params?: {
    status?: string;
    branch?: string;
    agentId?: string;
    search?: string;
  }): Promise<Quote[]> => {
    await delay(500);
    let filtered = [...mockQuotes];
    
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(q => q.status === params.status);
    }
    if (params?.branch && params.branch !== 'all') {
      filtered = filtered.filter(q => q.branch === params.branch);
    }
    if (params?.agentId && params.agentId !== 'all') {
      filtered = filtered.filter(q => q.agentId === params.agentId);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.leadName.toLowerCase().includes(search) ||
        q.carrier.toLowerCase().includes(search) ||
        q.quoteId.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  },

  updateQuoteStatus: async (quoteId: string, status: Quote['status']): Promise<Quote> => {
    await delay(300);
    const quote = mockQuotes.find(q => q.id === quoteId);
    if (!quote) throw new Error('Quote not found');
    
    quote.status = status;
    if (status === 'sent') quote.sentAt = new Date().toISOString();
    if (status === 'viewed') quote.viewedAt = new Date().toISOString();
    if (status === 'accepted') quote.acceptedAt = new Date().toISOString();
    if (status === 'rejected') quote.rejectedAt = new Date().toISOString();
    
    return quote;
  },

  sendWhatsApp: async (quoteIds: string[], message: string): Promise<void> => {
    await delay(800);
    quoteIds.forEach(id => {
      const quote = mockQuotes.find(q => q.id === id);
      if (quote) quote.whatsappSent = true;
    });
  },

  sendEmail: async (quoteIds: string[], template: string): Promise<void> => {
    await delay(600);
    quoteIds.forEach(id => {
      const quote = mockQuotes.find(q => q.id === id);
      if (quote) quote.emailSent = true;
    });
  },

  bulkUpdateStatus: async (quoteIds: string[], status: Quote['status']): Promise<void> => {
    await delay(400);
    quoteIds.forEach(id => {
      const quote = mockQuotes.find(q => q.id === id);
      if (quote) {
        quote.status = status;
        if (status === 'sent') quote.sentAt = new Date().toISOString();
      }
    });
  }
};

export const useQuotes = (params?: {
  status?: string;
  branch?: string;
  agentId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => quotesApi.getQuotes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: Quote['status'] }) =>
      quotesApi.updateQuoteStatus(quoteId, status),
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
    mutationFn: ({ quoteIds, message }: { quoteIds: string[]; message: string }) =>
      quotesApi.sendWhatsApp(quoteIds, message),
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
    mutationFn: ({ quoteIds, template }: { quoteIds: string[]; template: string }) =>
      quotesApi.sendEmail(quoteIds, template),
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
    mutationFn: ({ quoteIds, status }: { quoteIds: string[]; status: Quote['status'] }) =>
      quotesApi.bulkUpdateStatus(quoteIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quotes updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quotes');
    },
  });
};
