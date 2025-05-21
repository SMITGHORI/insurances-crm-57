
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const LeadFilters = ({ filterParams, setFilterParams }) => {
  const [searchTerm, setSearchTerm] = useState(filterParams.searchTerm || '');
  const isMobile = useIsMobile();
  
  // Dummy agent data
  const agents = ['All Agents', 'Raj Malhotra', 'Anita Kumar', 'Vikram Mehta'];
  
  // Lead status options
  const statusOptions = ['all', 'New', 'In Progress', 'Qualified', 'Closed', 'Lost'];
  
  // Lead source options
  const sourceOptions = ['all', 'Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Other'];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Apply search filter on submit
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    setFilterParams({
      ...filterParams,
      searchTerm: searchTerm
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterParams({
      status: 'all',
      source: 'all',
      assignedTo: 'all',
      searchTerm: ''
    });
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setFilterParams({
      ...filterParams,
      status: value
    });
  };

  // Handle source change
  const handleSourceChange = (value) => {
    setFilterParams({
      ...filterParams,
      source: value
    });
  };

  // Handle agent change
  const handleAgentChange = (value) => {
    setFilterParams({
      ...filterParams,
      assignedTo: value === 'All Agents' ? 'all' : value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4 md:mb-6 overflow-hidden">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Search field */}
        <form onSubmit={handleSubmitSearch} className="flex space-x-2 w-full">
          <Input
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full text-xs sm:text-sm"
          />
          <Button type="submit" variant="outline" size="icon" className="flex-shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Status filter */}
        <Select 
          value={filterParams.status} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status} className="text-xs sm:text-sm">
                  {status === 'all' ? 'All Statuses' : status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Source filter */}
        <Select 
          value={filterParams.source} 
          onValueChange={handleSourceChange}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sourceOptions.map((source) => (
                <SelectItem key={source} value={source} className="text-xs sm:text-sm">
                  {source === 'all' ? 'All Sources' : source}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Agent filter */}
        <Select 
          value={filterParams.assignedTo === 'all' ? 'All Agents' : filterParams.assignedTo} 
          onValueChange={handleAgentChange}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {agents.map((agent) => (
                <SelectItem key={agent} value={agent} className="text-xs sm:text-sm">
                  {agent}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button - only show if any filter is active */}
      {(filterParams.status !== 'all' || 
        filterParams.source !== 'all' || 
        filterParams.assignedTo !== 'all' || 
        filterParams.searchTerm) && (
        <div className="mt-3 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="text-xs flex items-center"
          >
            <X className="h-3 w-3 mr-1" /> Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
