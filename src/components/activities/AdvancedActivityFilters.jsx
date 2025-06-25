
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search, Calendar } from 'lucide-react';

const AdvancedActivityFilters = ({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  typeFilter,
  setTypeFilter,
  agentFilter,
  setAgentFilter,
  uniqueAgents,
  handleResetFilters,
  activeFilters = {}
}) => {
  const handleRemoveFilter = (filterKey) => {
    switch (filterKey) {
      case 'search':
        setSearchQuery('');
        break;
      case 'date':
        setDateFilter('all');
        break;
      case 'type':
        setTypeFilter('all');
        break;
      case 'agent':
        setAgentFilter('all');
        break;
      default:
        break;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (dateFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (agentFilter !== 'all') count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Activities</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities, clients, agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="client">Client Activities</SelectItem>
                <SelectItem value="policy">Policy Activities</SelectItem>
                <SelectItem value="claim">Claim Activities</SelectItem>
                <SelectItem value="lead">Lead Activities</SelectItem>
                <SelectItem value="quotation">Quotation Activities</SelectItem>
                <SelectItem value="payment">Payment Activities</SelectItem>
                <SelectItem value="communication">Communications</SelectItem>
                <SelectItem value="document">Document Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Agent</label>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {uniqueAgents.map(agent => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: "{searchQuery}"</span>
                  <button
                    onClick={() => handleRemoveFilter('search')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              
              {dateFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{dateFilter.replace('_', ' ')}</span>
                  <button
                    onClick={() => handleRemoveFilter('date')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Type: {typeFilter}</span>
                  <button
                    onClick={() => handleRemoveFilter('type')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              
              {agentFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Agent: {agentFilter}</span>
                  <button
                    onClick={() => handleRemoveFilter('agent')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedActivityFilters;
