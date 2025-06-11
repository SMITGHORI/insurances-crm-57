
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedSearch';

export const useOptimizedBroadcasts = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['broadcasts', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/broadcasts?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

export const useOptimizedBroadcastAnalytics = (broadcastId) => {
  return useOptimizedQuery({
    queryKey: ['broadcasts', broadcastId, 'analytics'],
    queryFn: async () => {
      const response = await fetch(`/api/broadcasts/${broadcastId}/analytics`);
      return response.json();
    },
    enabled: !!broadcastId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOptimizedOffers = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['offers', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/offers?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};
