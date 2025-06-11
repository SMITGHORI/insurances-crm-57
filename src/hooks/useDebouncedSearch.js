
import { useState, useEffect, useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';

export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, delay);

  const queryResult = useOptimizedQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: () => searchFn(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  });

  const searchResults = useMemo(() => {
    return {
      ...queryResult,
      searchTerm: debouncedSearchTerm,
      isSearching: searchTerm !== debouncedSearchTerm || queryResult.isLoading
    };
  }, [queryResult, searchTerm, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    ...searchResults
  };
};
