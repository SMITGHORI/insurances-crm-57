
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Optimized query hook with built-in performance enhancements
 */
export const useOptimizedQuery = (options) => {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    cacheTime = 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
    retry = 2,
    retryDelay = 1000,
    keepPreviousData = true,
    ...restOptions
  } = options;

  const queryResult = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    cacheTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry,
    retryDelay,
    keepPreviousData,
    ...restOptions
  });

  // Memoize the result to prevent unnecessary re-renders
  const memoizedResult = useMemo(() => ({
    ...queryResult,
    isInitialLoading: queryResult.isLoading && !queryResult.data,
    hasData: !!queryResult.data && !queryResult.isError
  }), [queryResult]);

  return memoizedResult;
};

/**
 * Hook for paginated data with optimizations
 */
export const usePaginatedQuery = (options) => {
  const {
    queryKey,
    queryFn,
    page = 1,
    limit = 20,
    ...restOptions
  } = options;

  const paginatedKey = useMemo(() => [...queryKey, { page, limit }], [queryKey, page, limit]);

  return useOptimizedQuery({
    queryKey: paginatedKey,
    queryFn: () => queryFn({ page, limit }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
    ...restOptions
  });
};

/**
 * Hook for infinite/virtual scrolling with optimizations
 */
export const useInfiniteOptimizedQuery = (options) => {
  const {
    queryKey,
    queryFn,
    getNextPageParam,
    enabled = true,
    staleTime = 5 * 60 * 1000,
    cacheTime = 10 * 60 * 1000,
    ...restOptions
  } = options;

  return useQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    enabled,
    staleTime,
    cacheTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    keepPreviousData: true,
    ...restOptions
  });
};
