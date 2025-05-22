
import React from 'react';
import { Calendar, Filter, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ActivityFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  dateFilter, 
  setDateFilter, 
  typeFilter, 
  setTypeFilter, 
  agentFilter, 
  setAgentFilter, 
  uniqueAgents, 
  handleResetFilters 
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 md:mb-6 p-3 md:p-4">
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-4 mb-3 md:mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search activities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[120px] md:w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            className="md:hidden"
            onClick={() => document.getElementById('mobileFilters').classList.toggle('hidden')}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div id="mobileFilters" className="md:flex space-y-3 md:space-y-0 md:space-x-3 hidden">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="claim">Claim</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="quotation">Quotation</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="commission">Commission</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {uniqueAgents.map((agent) => (
              <SelectItem key={agent} value={agent}>{agent}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="w-full md:w-auto"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ActivityFilters;
