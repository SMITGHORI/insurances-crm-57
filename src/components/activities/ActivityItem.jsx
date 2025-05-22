
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  Clock,
  FileEdit,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client':
        return <Users className="h-5 w-5 text-amba-blue" />;
      case 'policy':
        return <FileText className="h-5 w-5 text-amba-orange" />;
      case 'claim':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'quotation':
        return <FileEdit className="h-5 w-5 text-purple-500" />;
      case 'lead':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'payment':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'commission':
        return <FileText className="h-5 w-5 text-amba-orange" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div className="p-3 md:p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
            {getActivityIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
              <h4 className="font-medium text-sm md:text-base">{activity.action}</h4>
              <span className="text-xs text-gray-500 mt-1 md:mt-0">{activity.timestamp}</span>
            </div>
            
            {activity.client && (
              <div className="flex items-center mb-1.5 mt-1.5">
                <Users className="h-3.5 w-3.5 text-gray-500 mr-1" />
                <Link 
                  to={activity.clientId ? `/clients/${activity.clientId}` : "#"}
                  className="text-xs md:text-sm text-amba-blue hover:text-amba-lightblue flex items-center"
                >
                  <span>{activity.client}</span>
                  {activity.clientId && <LinkIcon className="h-3 w-3 ml-1" />}
                </Link>
              </div>
            )}
            
            <div className="flex items-center mb-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-500 mr-1" />
              <span className="text-xs">{formatDate(activity.time)}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
            
            <div className="flex flex-wrap gap-2 mt-1.5">
              {activity.policyId && (
                <Link
                  to={`/policies/${activity.policyId}`}
                  className="text-xs bg-blue-50 text-amba-blue hover:bg-blue-100 px-2 py-1 rounded-full inline-flex items-center"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View Policy
                </Link>
              )}
              
              {activity.claimId && (
                <Link
                  to={`/claims/${activity.claimId}`}
                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded-full inline-flex items-center"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  View Claim
                </Link>
              )}
              
              {activity.quotationId && (
                <Link
                  to={`/quotations/${activity.quotationId}`}
                  className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-1 rounded-full inline-flex items-center"
                >
                  <FileEdit className="h-3 w-3 mr-1" />
                  View Quotation
                </Link>
              )}
              
              {activity.leadId && (
                <Link
                  to={`/leads/${activity.leadId}`}
                  className="text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-2 py-1 rounded-full inline-flex items-center"
                >
                  <Star className="h-3 w-3 mr-1" />
                  View Lead
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
