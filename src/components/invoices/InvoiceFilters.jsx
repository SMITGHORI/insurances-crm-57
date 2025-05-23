
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  ChevronDown, 
  CircleX,
  Filter as FilterIcon
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const InvoiceFilters = ({ filterParams, setFilterParams, clearAllFilters }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      setFilterParams(prev => ({
        ...prev,
        dateRange: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd')
        }
      }));
    }
  };

  const handleClearFilter = (filterName) => {
    setFilterParams(prev => ({
      ...prev,
      [filterName]: 'all'
    }));
    
    if (filterName === 'dateRange') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Status</label>
          <Select
            value={filterParams.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {filterParams.status !== 'all' && (
            <button 
              className="text-xs text-gray-500 mt-1 flex items-center hover:text-gray-700"
              onClick={() => handleClearFilter('status')}
            >
              <CircleX className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  (startDate || filterParams.dateRange !== 'all') && "text-primary"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filterParams.dateRange === 'all' 
                  ? "Select date range" 
                  : typeof filterParams.dateRange === 'object'
                    ? `${filterParams.dateRange.start} to ${filterParams.dateRange.end}`
                    : filterParams.dateRange
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Start Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">End Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate && date < startDate}
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      handleClearFilter('dateRange');
                    }}
                  >
                    Clear
                  </Button>
                  <Button onClick={handleDateRangeChange} disabled={!startDate || !endDate}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {filterParams.dateRange !== 'all' && (
            <button 
              className="text-xs text-gray-500 mt-1 flex items-center hover:text-gray-700"
              onClick={() => handleClearFilter('dateRange')}
            >
              <CircleX className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Client Filter */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Client</label>
          <Select
            value={filterParams.clientId}
            onValueChange={(value) => handleFilterChange('clientId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="1">Rahul Sharma</SelectItem>
              <SelectItem value="2">Tech Solutions Ltd</SelectItem>
              <SelectItem value="3">Priya Patel</SelectItem>
              <SelectItem value="4">Global Enterprises</SelectItem>
            </SelectContent>
          </Select>
          {filterParams.clientId !== 'all' && (
            <button 
              className="text-xs text-gray-500 mt-1 flex items-center hover:text-gray-700"
              onClick={() => handleClearFilter('clientId')}
            >
              <CircleX className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Insurance Type Filter */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Policy Type</label>
          <Select
            value={filterParams.policyType}
            onValueChange={(value) => handleFilterChange('policyType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Health Insurance">Health Insurance</SelectItem>
              <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
              <SelectItem value="Life Insurance">Life Insurance</SelectItem>
              <SelectItem value="Property Insurance">Property Insurance</SelectItem>
              <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
            </SelectContent>
          </Select>
          {filterParams.policyType !== 'all' && (
            <button 
              className="text-xs text-gray-500 mt-1 flex items-center hover:text-gray-700"
              onClick={() => handleClearFilter('policyType')}
            >
              <CircleX className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Agent Filter */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Agent</label>
          <Select
            value={filterParams.agentId}
            onValueChange={(value) => handleFilterChange('agentId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="1">Priya Singh</SelectItem>
              <SelectItem value="2">Vikram Malhotra</SelectItem>
              <SelectItem value="3">Ananya Das</SelectItem>
            </SelectContent>
          </Select>
          {filterParams.agentId !== 'all' && (
            <button 
              className="text-xs text-gray-500 mt-1 flex items-center hover:text-gray-700"
              onClick={() => handleClearFilter('agentId')}
            >
              <CircleX className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Active Filters and Clear All */}
      <div className="flex flex-wrap items-center mt-4 gap-2">
        {Object.entries(filterParams).some(([key, value]) => value !== 'all') && (
          <>
            <span className="text-sm text-gray-500 mr-2 flex items-center">
              <FilterIcon className="h-3 w-3 mr-1" />
              Active filters:
            </span>
            {filterParams.status !== 'all' && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                Status: {filterParams.status}
                <button 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleClearFilter('status')}
                >
                  <CircleX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterParams.dateRange !== 'all' && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                Date Range
                <button 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleClearFilter('dateRange')}
                >
                  <CircleX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterParams.clientId !== 'all' && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                Client Filter
                <button 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleClearFilter('clientId')}
                >
                  <CircleX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterParams.policyType !== 'all' && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                Type: {filterParams.policyType}
                <button 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleClearFilter('policyType')}
                >
                  <CircleX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterParams.agentId !== 'all' && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center">
                Agent Filter
                <button 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => handleClearFilter('agentId')}
                >
                  <CircleX className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button
              variant="link"
              size="sm"
              className="text-primary ml-auto"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceFilters;
