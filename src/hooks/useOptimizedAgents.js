
import { useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { useDebouncedValue } from './useDebouncedSearch';

export const useOptimizedAgents = (filters = {}) => {
  const debouncedSearch = useDebouncedValue(filters.search || '', 300);
  
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  return useOptimizedQuery({
    queryKey: ['agents', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/agents?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - agents don't change frequently
    enabled: true,
  });
};

export const useOptimizedAgentPerformance = (agentId, timeframe = '30d') => {
  return useOptimizedQuery({
    queryKey: ['agents', agentId, 'performance', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/performance?timeframe=${timeframe}`);
      return response.json();
    },
    enabled: !!agentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useOptimizedAgentCommissions = (agentId, filters = {}) => {
  const queryParams = useMemo(() => ({
    ...filters,
    agentId,
  }), [filters, agentId]);

  return useOptimizedQuery({
    queryKey: ['agents', agentId, 'commissions', queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/commissions?${new URLSearchParams(queryParams)}`);
      return response.json();
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
