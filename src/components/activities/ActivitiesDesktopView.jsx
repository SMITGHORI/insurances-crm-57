
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Loader2 } from 'lucide-react';

const ActivitiesDesktopView = ({ activities, loading, getActivityIcon, formatDate }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amba-blue" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <span>{activity.action}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{activity.type}</span>
                </TableCell>
                <TableCell>
                  {activity.client ? (
                    <div 
                      className="flex items-center text-primary hover:underline cursor-pointer"
                    >
                      <Link 
                        to={activity.clientId ? `/clients/${activity.clientId}` : "#"}
                        className="flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        {activity.client}
                      </Link>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div 
                    className="flex items-center text-primary hover:underline cursor-pointer"
                  >
                    <Link 
                      to={activity.agentId ? `/agents/${activity.agentId}` : "#"}
                      className="flex items-center"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {activity.agent}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{formatDate(activity.time)}</div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{activity.details}</div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {activity.policyId && (
                        <Link
                          to={`/policies/${activity.policyId}`}
                          className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                        >
                          View Policy
                        </Link>
                      )}
                      {activity.claimId && (
                        <Link
                          to={`/claims/${activity.claimId}`}
                          className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                        >
                          View Claim
                        </Link>
                      )}
                      {activity.quotationId && (
                        <Link
                          to={`/quotations/${activity.quotationId}`}
                          className="text-xs text-amba-blue hover:text-amba-lightblue mr-2"
                        >
                          View Quotation
                        </Link>
                      )}
                      {activity.leadId && (
                        <Link
                          to={`/leads/${activity.leadId}`}
                          className="text-xs text-amba-blue hover:text-amba-lightblue"
                        >
                          View Lead
                        </Link>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No activities found matching your filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivitiesDesktopView;
