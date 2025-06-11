
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedSearch';

export const useOptimizedInvoices = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['invoices', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/invoices?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

export const useOptimizedInvoiceStats = (timeframe = '30d') => {
  return useOptimizedQuery({
    queryKey: ['invoices', 'stats', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/stats?timeframe=${timeframe}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOptimizedPaymentReminders = (filters = {}) => {
  return useOptimizedQuery({
    queryKey: ['invoices', 'payment-reminders', filters],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/payment-reminders?${new URLSearchParams(filters)}`);
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
