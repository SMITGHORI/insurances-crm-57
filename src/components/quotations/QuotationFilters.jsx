
import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const QuotationFilters = ({ 
  filterParams, 
  setFilterParams, 
  activeFilters = {}, 
  updateActiveFilters,
  clearAllFilters
}) => {
  const [date, setDate] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const isMobile = useIsMobile();

  const handleFilterChange = (key, value) => {
    setFilterParams((prev) => ({ ...prev, [key]: value }));
    if (key !== 'searchTerm') {
      updateActiveFilters(
        key === 'insuranceType' ? 'Insurance Type' : 
        key === 'status' ? 'Status' : 
        key === 'agentId' ? 'Agent' : 
        key === 'dateRange' ? 'Date' : key, 
        value === 'all' ? null : value
      );
    }
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    const dateRange = selectedDate ? 'custom' : 'all';
    handleFilterChange('dateRange', dateRange);
    if (selectedDate) {
      updateActiveFilters('Date', format(selectedDate, 'PPP'));
    } else {
      updateActiveFilters('Date', null);
    }
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const removeFilter = (key) => {
    const filterKey = 
      key === 'Insurance Type' ? 'insuranceType' : 
      key === 'Status' ? 'status' : 
      key === 'Agent' ? 'agentId' : 
      key === 'Date' ? 'dateRange' : key.toLowerCase();
      
    if (filterKey === 'dateRange') {
      setDate(null);
    }
    
    setFilterParams(prev => ({
      ...prev,
      [filterKey]: 'all'
    }));
    
    updateActiveFilters(key, null);
  };

  return (
    <Card className="bg-white p-4 rounded-lg shadow mb-6 border-0 shadow-sm">
      {/* Search always visible */}
      <div className="relative w-full mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by quote ID, client name..."
          value={filterParams.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      {/* Active filters display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge 
              key={key} 
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
            >
              {key}: {value}
              <button 
                onClick={() => removeFilter(key)} 
                className="ml-1 hover:bg-blue-100 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            className="text-sm h-7 px-2 text-gray-500 hover:text-gray-700" 
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {isMobile && (
        <Button 
          variant="outline" 
          onClick={toggleFilters} 
          className="w-full flex justify-between items-center mb-2"
        >
          <span className="flex items-center">
            <Filter size={16} className="mr-2" />
            Filters
          </span>
          {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      )}

      {(!isMobile || filtersExpanded) && (
        <div className="flex flex-wrap gap-4 mt-2 animate-fade-in">
          {/* Status Filter */}
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterParams.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insurance Type Filter */}
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterParams.insuranceType}
              onValueChange={(value) => handleFilterChange('insuranceType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Insurance Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="health">Health Insurance</SelectItem>
                <SelectItem value="term">Term Insurance</SelectItem>
                <SelectItem value="life">Life Insurance</SelectItem>
                <SelectItem value="motor">Motor Insurance</SelectItem>
                <SelectItem value="property">Property Insurance</SelectItem>
                <SelectItem value="travel">Travel Insurance</SelectItem>
                <SelectItem value="group">Group Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center w-full sm:w-auto">
            <Calendar size={16} className="mr-1 text-gray-500" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Agent Filter */}
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={16} className="mr-1 text-gray-500" />
            <Select
              value={filterParams.agentId}
              onValueChange={(value) => handleFilterChange('agentId', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="agent1">Rajiv Kumar</SelectItem>
                <SelectItem value="agent2">Priya Singh</SelectItem>
                <SelectItem value="agent3">Amir Khan</SelectItem>
                <SelectItem value="agent4">Neha Sharma</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuotationFilters;
