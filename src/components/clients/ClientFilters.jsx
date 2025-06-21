
import React, { useState } from 'react';
import { Search, Filter, Download, SortAsc, SortDesc, X, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ClientExportDialog from './ClientExportDialog';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';
import { useClientSearch } from '../../hooks/useClientFeatures';
import { toast } from 'sonner';

const ClientFilters = ({
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  filterOptions,
  handleExport,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  activeFilters,
  removeFilter,
  placeholderText = "Search clients...",
  selectedClients = [],
  filteredData = [],
  allData = []
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Enhanced search with debouncing
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const { data: searchSuggestions, isLoading: isSearching } = useClientSearch(
    debouncedSearchTerm,
    debouncedSearchTerm.length >= 2
  );

  const toggleSort = field => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportAction = async (exportData) => {
    setIsExporting(true);
    try {
      await handleExport(exportData);
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchSuggestions(value.length >= 2);
  };

  const handleSearchSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSearchSuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Enhanced Search with Suggestions */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text" 
              className="pl-10 pr-3" 
              placeholder={placeholderText} 
              value={searchTerm} 
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length >= 2 && setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchSuggestions.slice(0, 5).map((suggestion) => (
                  <div
                    key={suggestion._id || suggestion.id}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSearchSuggestionClick(suggestion)}
                  >
                    <div className="font-medium text-sm">{suggestion.name}</div>
                    <div className="text-xs text-gray-500">{suggestion.email} • {suggestion.type}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amba-blue"></div>
              </div>
            )}
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-amba-blue focus:border-amba-blue" 
              value={selectedFilter} 
              onChange={e => setSelectedFilter(e.target.value)}
            >
              {filterOptions.map(option => 
                <option key={option} value={option}>{option}</option>
              )}
            </select>
          </div>
          
          {/* Sort Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('name')}
              className="flex items-center"
            >
              {sortField === 'name' && sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Name
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('createdAt')}
              className="flex items-center"
            >
              {sortField === 'createdAt' && sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Date
            </Button>
          </div>
        </div>
        
        {/* Export Button */}
        <div className="flex items-center space-x-2">
          <ClientExportDialog
            selectedClients={selectedClients}
            filteredData={filteredData}
            allData={allData}
            searchTerm={searchTerm}
            selectedFilter={selectedFilter}
            onExport={handleExportAction}
          />
        </div>
      </div>
      
      {/* Active Filters */}
      {activeFilters && activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter.name}: {filter.value}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => removeFilter(filter.name)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Search Results Summary */}
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          {filteredData.length} results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ClientFilters;
