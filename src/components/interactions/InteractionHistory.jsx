
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Search, Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useInteractions, useCreateInteraction } from '../../hooks/useInteractions';

const InteractionHistory = ({ clientId = null, showCreateButton = true }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    outcome: '',
    priority: ''
  });

  const queryParams = {
    ...(clientId && { clientId }),
    ...filters,
    page: 1,
    limit: 20
  };

  const { data: interactionsData, isLoading } = useInteractions(queryParams);
  const interactions = interactionsData?.data || [];

  const interactionTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'meeting', label: 'Meeting', icon: User },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'visit', label: 'Visit', icon: User },
    { value: 'other', label: 'Other', icon: MessageSquare }
  ];

  const outcomes = [
    { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-800' },
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
    { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-800' },
    { value: 'follow_up_needed', label: 'Follow-up Needed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'no_response', label: 'No Response', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const getTypeIcon = (type) => {
    const typeObj = interactionTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : MessageSquare;
  };

  const getOutcomeColor = (outcome) => {
    const outcomeObj = outcomes.find(o => o.value === outcome);
    return outcomeObj ? outcomeObj.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      outcome: '',
      priority: ''
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Interaction History</h2>
          <p className="text-sm text-gray-600">
            {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {showCreateButton && (
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Log Interaction</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search interactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {interactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.outcome}
              onValueChange={(value) => handleFilterChange('outcome', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Outcomes</SelectItem>
                {outcomes.map((outcome) => (
                  <SelectItem key={outcome.value} value={outcome.value}>
                    {outcome.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(filters.search || filters.type || filters.outcome || filters.priority) && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactions List */}
      <div className="space-y-4">
        {interactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                No interactions found matching your criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          interactions.map((interaction) => {
            const TypeIcon = getTypeIcon(interaction.type);
            
            return (
              <Card key={interaction._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {interaction.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {interaction.description}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={getPriorityColor(interaction.priority)}>
                            {interaction.priority}
                          </Badge>
                          <Badge className={getOutcomeColor(interaction.outcome)}>
                            {interaction.outcome.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(interaction.interactionDate), 'MMM dd, yyyy')}
                        </div>
                        
                        {interaction.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {interaction.duration} minutes
                          </div>
                        )}

                        {!clientId && interaction.clientId && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {interaction.clientId.displayName}
                          </div>
                        )}

                        <Badge variant="outline" className="capitalize">
                          {interaction.type}
                        </Badge>
                      </div>

                      {interaction.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{interaction.notes}</p>
                        </div>
                      )}

                      {interaction.followUpRequired && (
                        <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              Follow-up required
                              {interaction.followUpDate && (
                                <span className="ml-1">
                                  on {format(new Date(interaction.followUpDate), 'MMM dd, yyyy')}
                                </span>
                              )}
                            </span>
                          </div>
                          {interaction.followUpNotes && (
                            <p className="text-sm text-yellow-700 mt-1">
                              {interaction.followUpNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {interaction.tags && interaction.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {interaction.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InteractionHistory;
