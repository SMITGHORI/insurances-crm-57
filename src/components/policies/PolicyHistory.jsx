
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PolicyHistory = ({ policy }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy History</CardTitle>
      </CardHeader>
      <CardContent>
        {policy.history && policy.history.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
            {policy.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((event, index) => (
              <div key={index} className="relative pb-6">
                <span className="absolute -left-[25px] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  {getHistoryIcon(event.action)}
                </span>
                <div className="ml-6">
                  <h3 className="font-medium">{event.action}</h3>
                  <p className="text-gray-600 mb-1">{event.details}</p>
                  <div className="text-xs text-gray-500 flex gap-4">
                    <span>By: {event.by}</span>
                    <span>{formatDate(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No history available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Function to determine the icon for different history events
const getHistoryIcon = (action) => {
  if (action === 'Created') return '🆕';
  if (action === 'Updated') return '✏️';
  if (action === 'Status Changed') return '🔄';
  if (action === 'Document Uploaded') return '📄';
  if (action === 'Document Deleted') return '🗑️';
  if (action === 'Renewal Added') return '🔁';
  if (action === 'Payment Recorded') return '💰';
  if (action === 'Payment Deleted') return '❌';
  if (action === 'Premium Updated') return '💵';
  if (action === 'Endorsement Added') return '📝';
  if (action === 'Endorsement Deleted') return '🗑️';
  return '📌'; // Default icon
};

export default PolicyHistory;
