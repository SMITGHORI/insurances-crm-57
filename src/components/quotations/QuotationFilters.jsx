
import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
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

const QuotationFilters = ({ filterParams, setFilterParams }) => {
  const [date, setDate] = React.useState(null);

  const handleFilterChange = (key, value) => {
    setFilterParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    const dateRange = selectedDate ? 'custom' : 'all';
    handleFilterChange('dateRange', dateRange);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by quote ID, client name..."
            value={filterParams.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center">
          <Filter size={16} className="mr-1 text-gray-500" />
          <Select
            value={filterParams.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[160px]">
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
        <div className="flex items-center">
          <Filter size={16} className="mr-1 text-gray-500" />
          <Select
            value={filterParams.insuranceType}
            onValueChange={(value) => handleFilterChange('insuranceType', value)}
          >
            <SelectTrigger className="w-[180px]">
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
        <div className="flex items-center">
          <Calendar size={16} className="mr-1 text-gray-500" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Agent Filter */}
        <div className="flex items-center">
          <Filter size={16} className="mr-1 text-gray-500" />
          <Select
            value={filterParams.agentId}
            onValueChange={(value) => handleFilterChange('agentId', value)}
          >
            <SelectTrigger className="w-[180px]">
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
    </div>
  );
};

export default QuotationFilters;
