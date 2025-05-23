
import React from 'react';
import { Search, Filter, Download, SortAsc, SortDesc, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const LeadFilters = ({ 
  filterParams, 
  setFilterParams, 
  sortField, 
  sortDirection, 
  setSortField, 
  setSortDirection, 
  handleExport,
  activeFilters,
  removeFilter
}) => {
  const isMobile = useIsMobile();
  
  const handleFilterChange = (field, value) => {
    setFilterParams(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update active filters
    if (field !== 'searchTerm') {
      if (value === 'all') {
        removeFilter(getFilterLabel(field));
      } else {
        updateActiveFilters(getFilterLabel(field), value);
      }
    }
  };

  const handleSearch = (e) => {
    setFilterParams(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const clearFilters = () => {
    setFilterParams({
      status: 'all',
      source: 'all',
      assignedTo: 'all',
      priority: 'all',
      searchTerm: ''
    });
    // Clear all active filters
    clearActiveFilters();
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getFilterLabel = (field) => {
    switch(field) {
      case 'status': return 'Status';
      case 'source': return 'Source';
      case 'assignedTo': return 'Agent';
      case 'priority': return 'Priority';
      default: return field;
    }
  };

  const updateActiveFilters = (name, value) => {
    // This function will be handled by the parent
  };

  const clearActiveFilters = () => {
    // This function will be handled by the parent
  };

  // Source options
  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Event', label: 'Event' },
    { value: 'Other', label: 'Other' }
  ];
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'New', label: 'New' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Not Interested', label: 'Not Interested' },
    { value: 'Closed', label: 'Closed' }
  ];
  
  // Agent options
  const agentOptions = [
    { value: 'all', label: 'All Agents' },
    { value: 'Raj Malhotra', label: 'Raj Malhotra' },
    { value: 'Anita Kumar', label: 'Anita Kumar' },
    { value: 'Vikram Mehta', label: 'Vikram Mehta' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  if (isMobile) {
    return (
      <div className="px-3 py-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            className="pl-9 bg-gray-50"
            value={filterParams.searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <Collapsible className="w-full">
            <div className="flex justify-between items-center">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-700">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </CollapsibleTrigger>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="flex items-center gap-1 text-gray-700"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            
            <CollapsibleContent className="mt-3 space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <Select 
                  value={filterParams.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Source</p>
                <Select 
                  value={filterParams.source} 
                  onValueChange={(value) => handleFilterChange('source', value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <Select 
                  value={filterParams.assignedTo} 
                  onValueChange={(value) => handleFilterChange('assignedTo', value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Filter by agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <Select 
                  value={filterParams.priority} 
                  onValueChange={(value) => handleFilterChange('priority', value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(filterParams.status !== 'all' || filterParams.source !== 'all' || 
                filterParams.assignedTo !== 'all' || filterParams.priority !== 'all') && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs w-full">
                  Clear All Filters
                </Button>
              )}

              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex items-center gap-1 px-2 ${sortField === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
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
                    className={`flex items-center gap-1 px-2 ${sortField === 'status' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                    onClick={() => toggleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                      <SortAsc className="h-3 w-3" /> : 
                      <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex items-center gap-1 px-2 ${sortField === 'priority' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                    onClick={() => toggleSort('priority')}
                  >
                    Priority
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? 
                      <SortAsc className="h-3 w-3" /> : 
                      <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {activeFilters && activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
  }
  
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone"
              className="pl-9"
              value={filterParams.searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row gap-2">
            <Select 
              value={filterParams.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filterParams.source} 
              onValueChange={(value) => handleFilterChange('source', value)}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filterParams.assignedTo} 
              onValueChange={(value) => handleFilterChange('assignedTo', value)}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                {agentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filterParams.priority} 
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {(filterParams.status !== 'all' || filterParams.source !== 'all' || 
            filterParams.assignedTo !== 'all' || filterParams.priority !== 'all') && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          )}
          
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-1 px-2 ${sortField === 'name' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
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
            className={`flex items-center gap-1 px-2 ${sortField === 'status' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
            onClick={() => toggleSort('status')}
          >
            Status
            {sortField === 'status' && (
              sortDirection === 'asc' ? 
              <SortAsc className="h-3 w-3" /> : 
              <SortDesc className="h-3 w-3" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-1 px-2 ${sortField === 'priority' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
            onClick={() => toggleSort('priority')}
          >
            Priority
            {sortField === 'priority' && (
              sortDirection === 'asc' ? 
              <SortAsc className="h-3 w-3" /> : 
              <SortDesc className="h-3 w-3" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-1 px-2 ${sortField === 'nextFollowUp' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
            onClick={() => toggleSort('nextFollowUp')}
          >
            Follow-up Date
            {sortField === 'nextFollowUp' && (
              sortDirection === 'asc' ? 
              <SortAsc className="h-3 w-3" /> : 
              <SortDesc className="h-3 w-3" />
            )}
          </Button>
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

export default LeadFilters;
