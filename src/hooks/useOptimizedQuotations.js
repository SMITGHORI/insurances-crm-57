
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedSearch';

export const useOptimizedQuotations = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['quotations', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/quotations?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

export const useOptimizedQuotationComparison = (quotationIds) => {
  const ids = useMemo(() => quotationIds?.filter(Boolean) || [], [quotationIds]);
  
  return useOptimizedQuery({
    queryKey: ['quotations', 'comparison', ids],
    queryFn: async () => {
      if (ids.length === 0) return { quotations: [] };
      const response = await fetch(`/api/quotations/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationIds: ids }),
      });
      return response.json();
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
