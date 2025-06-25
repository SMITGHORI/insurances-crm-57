
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus, Phone, Mail, MessageSquare, Video, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const LeadFollowUps = ({ leadId }) => {
  const [followUps, setFollowUps] = useState([
    {
      id: '1',
      date: '2024-01-20',
      time: '14:30',
      type: 'Call',
      outcome: 'Discussed health insurance options. Client interested in family coverage.',
      nextAction: 'Send brochure and premium quotes',
      createdBy: 'Agent John',
      createdAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '10:00',
      type: 'Email',
      outcome: 'Sent initial product information. Client responded with questions.',
      nextAction: 'Schedule call to discuss details',
      createdBy: 'Agent Smith',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const [newFollowUp, setNewFollowUp] = useState({
    date: null,
    time: '',
    type: '',
    outcome: '',
    nextAction: ''
  });

  const followUpTypes = [
    { value: 'Call', label: 'Call', icon: Phone },
    { value: 'Email', label: 'Email', icon: Mail },
    { value: 'Meeting', label: 'Meeting', icon: Video },
    { value: 'SMS', label: 'SMS', icon: MessageSquare },
    { value: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare }
  ];

  const getTypeIcon = (type) => {
    const followUpType = followUpTypes.find(t => t.value === type);
    if (followUpType) {
      const IconComponent = followUpType.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'Call': 'bg-green-100 text-green-800',
      'Email': 'bg-blue-100 text-blue-800',
      'Meeting': 'bg-purple-100 text-purple-800',
      'SMS': 'bg-orange-100 text-orange-800',
      'WhatsApp': 'bg-green-100 text-green-800'
    };
    return <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
      <span className="flex items-center space-x-1">
        {getTypeIcon(type)}
        <span>{type}</span>
      </span>
    </Badge>;
  };

  const handleAddFollowUp = () => {
    if (!newFollowUp.date || !newFollowUp.time || !newFollowUp.type || !newFollowUp.outcome) {
      toast.error('Please fill in all required fields');
      return;
    }

    const followUp = {
      id: Date.now().toString(),
      date: format(newFollowUp.date, 'yyyy-MM-dd'),
      time: newFollowUp.time,
      type: newFollowUp.type,
      outcome: newFollowUp.outcome,
      nextAction: newFollowUp.nextAction,
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setFollowUps([followUp, ...followUps]);
    setNewFollowUp({
      date: null,
      time: '',
      type: '',
      outcome: '',
      nextAction: ''
    });
    toast.success('Follow-up added successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Follow-ups</h3>
        <p className="text-sm text-gray-600">Track and manage lead follow-up activities</p>
      </div>

      {/* Add New Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Follow-up</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newFollowUp.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newFollowUp.date ? format(newFollowUp.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newFollowUp.date}
                    onSelect={(date) => setNewFollowUp({...newFollowUp, date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={newFollowUp.time}
                onChange={(e) => setNewFollowUp({...newFollowUp, time: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select value={newFollowUp.type} onValueChange={(value) => setNewFollowUp({...newFollowUp, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {followUpTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Outcome *</label>
            <Textarea
              value={newFollowUp.outcome}
              onChange={(e) => setNewFollowUp({...newFollowUp, outcome: e.target.value})}
              placeholder="Describe the outcome of this follow-up"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Next Action</label>
            <Textarea
              value={newFollowUp.nextAction}
              onChange={(e) => setNewFollowUp({...newFollowUp, nextAction: e.target.value})}
              placeholder="What's the next action to take?"
              rows={2}
            />
          </div>
          
          <Button onClick={handleAddFollowUp} className="w-full">
            Add Follow-up
          </Button>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {followUps.map(followUp => (
          <Card key={followUp.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeBadge(followUp.type)}
                  <span className="text-sm text-gray-600">
                    {formatDate(followUp.date)} at {followUp.time}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  by {followUp.createdBy}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Outcome:</span>
                  <p className="text-sm text-gray-600 mt-1">{followUp.outcome}</p>
                </div>
                
                {followUp.nextAction && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Next Action:</span>
                    <p className="text-sm text-gray-600 mt-1">{followUp.nextAction}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {followUps.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups yet</h3>
            <p className="text-gray-500">Add the first follow-up for this lead</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadFollowUps;
