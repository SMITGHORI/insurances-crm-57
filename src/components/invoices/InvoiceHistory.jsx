
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Edit, Send, Eye, CheckCircle, XCircle, User } from 'lucide-react';

const InvoiceHistory = ({ history = [] }) => {
  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'updated':
      case 'edited':
        return <Edit className="h-4 w-4 text-amber-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'duplicated':
        return <Clock className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No history available for this invoice</p>
          ) : (
            <div className="relative border-l-2 border-gray-200 pl-4 ml-2">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className={`mb-6 relative ${index === history.length - 1 ? '' : ''}`}
                >
                  <div className="absolute -left-[21px] bg-white p-1 rounded-full">
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <User className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-sm">{item.user}</span>
                  </div>
                  <p className="text-gray-600">{item.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHistory;
