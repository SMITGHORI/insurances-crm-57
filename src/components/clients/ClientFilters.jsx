
import React, { useState } from 'react';
import { Search, Filter, Download, SortAsc, SortDesc, X, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportAction = async (format, type) => {
    setIsExporting(true);
    
    try {
      let exportData = {
        format,
        type
      };

      // Add specific data based on export type
      switch (type) {
        case 'selected':
          if (selectedClients.length === 0) {
            toast.error('Please select clients to export');
            return;
          }
          exportData.selectedIds = selectedClients.map(client => client._id);
          break;
          
        case 'filtered':
          exportData.filters = {
            search: searchTerm,
            type: selectedFilter !== 'All' ? selectedFilter : undefined,
            // Add other active filters
            ...activeFilters
          };
          break;
          
        case 'dateRange':
          // You can add date range picker here
          const startDate = prompt('Enter start date (YYYY-MM-DD):');
          const endDate = prompt('Enter end date (YYYY-MM-DD):');
          if (!startDate || !endDate) {
            toast.error('Please provide valid date range');
            return;
          }
          exportData.filters = { startDate, endDate };
          break;
          
        case 'all':
        default:
          // No additional data needed
          break;
      }

      // Call the export function
      if (handleExport) {
        await handleExport(exportData);
        toast.success(`Export completed successfully`);
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const ExportDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex items-center"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-1" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-900">Export Format</div>
        
        {/* All Data */}
        <div className="px-2 py-1 text-xs font-medium text-gray-500 border-t">All Data ({allData.length} items)</div>
        <DropdownMenuItem onClick={() => handleExportAction('csv', 'all')}>
          <FileDown className="h-4 w-4 mr-2" />
          Export All as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAction('excel', 'all')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export All as Excel
        </DropdownMenuItem>
        
        {/* Filtered Data */}
        {(searchTerm || selectedFilter !== 'All' || Object.keys(activeFilters || {}).length > 0) && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-t">Filtered Data ({filteredData.length} items)</div>
            <DropdownMenuItem onClick={() => handleExportAction('csv', 'filtered')}>
              <FileDown className="h-4 w-4 mr-2" />
              Export Filtered as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportAction('excel', 'filtered')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Filtered as Excel
            </DropdownMenuItem>
          </>
        )}
        
        {/* Selected Data */}
        {selectedClients.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-t">Selected Data ({selectedClients.length} items)</div>
            <DropdownMenuItem onClick={() => handleExportAction('csv', 'selected')}>
              <FileDown className="h-4 w-4 mr-2" />
              Export Selected as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportAction('excel', 'selected')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Selected as Excel
            </DropdownMenuItem>
          </>
        )}
        
        {/* Date Range */}
        <div className="px-2 py-1 text-xs font-medium text-gray-500 border-t">Date Range</div>
        <DropdownMenuItem onClick={() => handleExportAction('csv', 'dateRange')}>
          <FileDown className="h-4 w-4 mr-2" />
          Export Date Range as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAction('excel', 'dateRange')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Date Range as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3"
              placeholder={placeholderText}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-amba-blue focus:border-amba-blue"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => toggleSort('name')}
            >
              Name
              {sortField === 'name' && (
                sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => toggleSort('type')}
            >
              Type
              {sortField === 'type' && (
                sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ExportDropdown />
        </div>
      </div>
      
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
    </div>
  );
};

export default ClientFilters;
