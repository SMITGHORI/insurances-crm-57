
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useFollowUps, useCompleteFollowUp } from '../../hooks/useFollowUps';
import { format } from 'date-fns';

const FollowUpList = ({ 
  followUps, 
  isLoading, 
  emptyMessage = "No follow-ups found",
  showOverdue = false,
  showPagination = false 
}) => {
  const { mutate: completeFollowUp } = useCompleteFollowUp();
  const { data: paginatedData, isLoading: paginatedLoading } = useFollowUps(
    showPagination ? { page: 1, limit: 10 } : {}
  );

  const dataToShow = showPagination ? paginatedData?.data : followUps;
  const loading = showPagination ? paginatedLoading : isLoading;

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rescheduled: 'bg-yellow-100 text-yellow-800',
      no_show: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.scheduled;
  };

  const handleCompleteFollowUp = (followUpId) => {
    completeFollowUp({
      id: followUpId,
      completionData: {
        outcome: 'successful',
        completionNotes: 'Follow-up completed successfully'
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!dataToShow || dataToShow.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataToShow.map((followUp) => (
            <TableRow key={followUp._id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {followUp.clientId?.displayName || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      {followUp.clientId?.email && (
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {followUp.clientId.email}
                        </span>
                      )}
                      {followUp.clientId?.phone && (
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {followUp.clientId.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {followUp.title}
                  </div>
                  {followUp.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {followUp.description}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {followUp.type.replace('_', ' ')}
                </Badge>
              </TableCell>
              
              <TableCell>
                <Badge className={getPriorityColor(followUp.priority)}>
                  {followUp.priority}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(followUp.scheduledDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {followUp.scheduledTime}
                  </div>
                  {showOverdue && (
                    <Badge variant="destructive" className="mt-1">
                      Overdue
                    </Badge>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge className={getStatusColor(followUp.status)}>
                  {followUp.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  {followUp.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteFollowUp(followUp._id)}
                      className="flex items-center space-x-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete</span>
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <span>View</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FollowUpList;
