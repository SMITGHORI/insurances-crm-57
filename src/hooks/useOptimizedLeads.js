
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedSearch';

export const useOptimizedLeads = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['leads', queryParams],
    queryFn: async () => {
      // Simulated API call - replace with actual API
      const response = await fetch(`/api/leads?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

export const useOptimizedLeadStats = (timeframe = '30d') => {
  return useOptimizedQuery({
    queryKey: ['leads', 'stats', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/leads/stats?timeframe=${timeframe}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
