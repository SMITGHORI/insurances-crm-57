
import React from 'react';
import { Search, Filter } from 'lucide-react';
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

const LeadFilters = ({ filterParams, setFilterParams }) => {
  const isMobile = useIsMobile();
  
  const handleFilterChange = (field, value) => {
    setFilterParams(prev => ({
      ...prev,
      [field]: value
    }));
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
      searchTerm: ''
    });
  };

  // Source options
  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Social Media', label: 'Social Media' }
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
    { value: 'Anita Kumar', label: 'Anita Kumar' }
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
        
        <Collapsible className="w-full">
          <div className="flex justify-between items-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-700">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </CollapsibleTrigger>
            
            {(filterParams.status !== 'all' || filterParams.source !== 'all' || filterParams.assignedTo !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear Filters
              </Button>
            )}
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-wrap gap-4 items-end">
      <div className="relative w-full md:w-64 flex-grow md:flex-grow-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or phone"
          className="pl-9"
          value={filterParams.searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="w-full sm:w-auto">
        <p className="text-xs text-gray-500 mb-1">Status</p>
        <Select 
          value={filterParams.status} 
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

      <div className="w-full sm:w-auto">
        <p className="text-xs text-gray-500 mb-1">Source</p>
        <Select 
          value={filterParams.source} 
          onValueChange={(value) => handleFilterChange('source', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

      <div className="w-full sm:w-auto">
        <p className="text-xs text-gray-500 mb-1">Assigned To</p>
        <Select 
          value={filterParams.assignedTo} 
          onValueChange={(value) => handleFilterChange('assignedTo', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

      {(filterParams.status !== 'all' || filterParams.source !== 'all' || filterParams.assignedTo !== 'all') && (
        <Button variant="ghost" onClick={clearFilters} className="ml-auto">
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default LeadFilters;
