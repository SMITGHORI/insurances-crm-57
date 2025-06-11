
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';

const OptimizedFilters = ({ 
  filters = [], 
  onFiltersChange, 
  searchPlaceholder = "Search...",
  showSearch = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filterValues).filter(value => value && value !== 'all').length +
           (debouncedSearchTerm ? 1 : 0);
  }, [filterValues, debouncedSearchTerm]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    
    onFiltersChange?.({
      search: debouncedSearchTerm,
      ...newFilters
    });
  }, [filterValues, debouncedSearchTerm, onFiltersChange]);

  // Handle search change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Update filters when search term changes
  React.useEffect(() => {
    onFiltersChange?.({
      search: debouncedSearchTerm,
      ...filterValues
    });
  }, [debouncedSearchTerm, filterValues, onFiltersChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterValues({});
    onFiltersChange?.({ search: '' });
  }, [onFiltersChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {showSearch && (
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || 'all'}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizedFilters);
