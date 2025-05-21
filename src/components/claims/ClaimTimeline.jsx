
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  FileText,
  Check,
  X,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  FileCheck
} from 'lucide-react';

const ClaimTimeline = ({ claim }) => {
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'incident':
        return <AlertTriangle className="h-6 w-6 text-amber-500 bg-amber-100 p-1 rounded-full" />;
      case 'filed':
        return <FileText className="h-6 w-6 text-blue-500 bg-blue-100 p-1 rounded-full" />;
      case 'processing':
        return <Clock className="h-6 w-6 text-purple-500 bg-purple-100 p-1 rounded-full" />;
      case 'approved':
        return <Check className="h-6 w-6 text-green-500 bg-green-100 p-1 rounded-full" />;
      case 'rejected':
        return <X className="h-6 w-6 text-red-500 bg-red-100 p-1 rounded-full" />;
      case 'settled':
        return <CircleDollarSign className="h-6 w-6 text-emerald-500 bg-emerald-100 p-1 rounded-full" />;
      case 'document':
        return <FileCheck className="h-6 w-6 text-blue-500 bg-blue-100 p-1 rounded-full" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500 bg-gray-100 p-1 rounded-full" />;
    }
  };

  // Sort timeline events by date and time
  const sortedTimeline = [...claim.timeline].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA; // Most recent first
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Claim Timeline</h2>
      
      <div className="relative">
        <div className="absolute left-[17px] top-6 bottom-5 w-0.5 bg-gray-200"></div>
        {sortedTimeline.map((event, index) => (
          <div key={event.id} className="relative pl-10 pb-6">
            <div className="absolute left-0 mt-1">
              {getTimelineIcon(event.status)}
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium">{event.event}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{event.date} {event.time}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaimTimeline;
