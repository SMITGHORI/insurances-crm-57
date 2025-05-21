
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Timeline,
  TimelineContent,
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineSeparator
} from '@/components/ui/timeline';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';

const ClaimHistory = ({ claim }) => {
  // Sort history items chronologically
  const sortedHistory = claim.history ? 
    [...claim.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : 
    [];

  const getActionIcon = (action) => {
    switch (action) {
      case 'Claim Filed':
        return <FileText className="h-4 w-4" />;
      case 'Approved':
      case 'Claim Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
      case 'Claim Rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Documents Validated':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim History</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <Timeline>
            {sortedHistory.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot>
                    {getActionIcon(item.action)}
                  </TimelineDot>
                  {index < sortedHistory.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <div className="ml-4">
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-gray-500">
                      {item.details}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <User className="h-3 w-3 mr-1" />
                      {item.by} • {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <div className="text-center py-8">
            <p>No history available for this claim.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimHistory;
