
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Phone, Mail, Shield } from 'lucide-react';

const ClientTimeline = ({ clientId }) => {
  const timelineEvents = [
    {
      id: '1',
      type: 'policy_created',
      title: 'Policy Created',
      description: 'Life Insurance policy POL001 created',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Agent John',
      icon: Shield,
      color: 'blue'
    },
    {
      id: '2',
      type: 'document_uploaded',
      title: 'Document Uploaded',
      description: 'PAN Card uploaded and verified',
      timestamp: '2024-01-10T14:20:00Z',
      user: 'Agent Smith',
      icon: FileText,
      color: 'green'
    },
    {
      id: '3',
      type: 'call_logged',
      title: 'Call Logged',
      description: 'Follow-up call regarding policy renewal',
      timestamp: '2024-01-08T16:45:00Z',
      user: 'Agent John',
      icon: Phone,
      color: 'orange'
    },
    {
      id: '4',
      type: 'email_sent',
      title: 'Email Sent',
      description: 'Welcome email with policy details',
      timestamp: '2024-01-05T09:15:00Z',
      user: 'System',
      icon: Mail,
      color: 'purple'
    },
    {
      id: '5',
      type: 'client_created',
      title: 'Client Created',
      description: 'Client profile created in the system',
      timestamp: '2024-01-01T12:00:00Z',
      user: 'Agent John',
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
        <h3 className="text-lg font-semibold">Client Timeline</h3>
        <p className="text-sm text-gray-600">Complete history of client interactions and activities</p>
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
            <p className="text-gray-500">Client timeline will appear here as activities occur</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientTimeline;
