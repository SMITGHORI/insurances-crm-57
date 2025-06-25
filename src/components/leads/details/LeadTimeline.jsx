
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Phone, Mail, UserPlus, Calendar, StickyNote } from 'lucide-react';

const LeadTimeline = ({ leadId }) => {
  const timelineEvents = [
    {
      id: '1',
      type: 'follow_up',
      title: 'Follow-up Call',
      description: 'Discussed health insurance options with client',
      timestamp: '2024-01-20T14:30:00Z',
      user: 'Agent John',
      icon: Phone,
      color: 'green'
    },
    {
      id: '2',
      type: 'note_added',
      title: 'Note Added',
      description: 'Client interested in family coverage with dental',
      timestamp: '2024-01-18T14:30:00Z',
      user: 'Agent John',
      icon: StickyNote,
      color: 'blue'
    },
    {
      id: '3',
      type: 'email_sent',
      title: 'Email Sent',
      description: 'Product information and brochures sent',
      timestamp: '2024-01-16T10:15:00Z',
      user: 'Agent Smith',
      icon: Mail,
      color: 'purple'
    },
    {
      id: '4',
      type: 'assignment',
      title: 'Lead Assigned',
      description: 'Lead assigned to Agent John based on expertise',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Manager Admin',
      icon: UserPlus,
      color: 'orange'
    },
    {
      id: '5',
      type: 'lead_created',
      title: 'Lead Created',
      description: 'New lead created from website inquiry',
      timestamp: '2024-01-15T09:00:00Z',
      user: 'System',
      icon: User,
      color: 'gray'
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-100',
      green: 'text-green-500 bg-green-100',
      orange: 'text-orange-500 bg-orange-100',
      purple: 'text-purple-500 bg-purple-100',
      gray: 'text-gray-500 bg-gray-100'
    };
    return colors[color] || colors.gray;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Lead Timeline</h3>
        <p className="text-sm text-gray-600">Complete history of lead activities and interactions</p>
      </div>

      <div className="space-y-4">
        {timelineEvents.map((event, index) => {
          const IconComponent = event.icon;
          const isLast = index === timelineEvents.length - 1;
          
          return (
            <div key={event.id} className="relative">
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getIconColor(event.color)}`}>
                      <IconComponent size={16} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{event.description}</p>
                      
                      <div className="flex items-center space-x-1">
                        <User size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">by {event.user}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {timelineEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500">Lead timeline will appear here as activities occur</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadTimeline;
