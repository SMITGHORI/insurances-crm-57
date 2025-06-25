
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Send, Eye, CheckCircle, Edit } from 'lucide-react';

const QuotationTimeline = ({ quotationId }) => {
  const timelineEvents = [
    {
      id: '1',
      type: 'status_update',
      title: 'Quotation Sent',
      description: 'Quotation sent to client via email',
      timestamp: '2025-06-02T10:30:00Z',
      user: 'Agent Smith',
      icon: Send,
      color: 'blue'
    },
    {
      id: '2',
      type: 'note_added',
      title: 'Note Added',
      description: 'Added note about client requirements for dental coverage',
      timestamp: '2025-06-02T09:15:00Z',
      user: 'Agent Smith',
      icon: FileText,
      color: 'green'
    },
    {
      id: '3',
      type: 'quotation_updated',
      title: 'Quotation Updated',
      description: 'Updated premium calculation and product details',
      timestamp: '2025-06-01T16:45:00Z',
      user: 'Agent Smith',
      icon: Edit,
      color: 'orange'
    },
    {
      id: '4',
      type: 'quotation_created',
      title: 'Quotation Created',
      description: 'Initial quotation created for health insurance',
      timestamp: '2025-06-01T09:00:00Z',
      user: 'Agent Smith',
      icon: FileText,
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
        <h3 className="text-lg font-semibold">Quotation Timeline</h3>
        <p className="text-sm text-gray-600">Complete history of quotation activities and interactions</p>
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
            <p className="text-gray-500">Quotation timeline will appear here as activities occur</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationTimeline;
