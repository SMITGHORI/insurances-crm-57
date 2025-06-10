
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Calendar, Users, TrendingUp, Mail, MessageSquare } from 'lucide-react';
import { useBroadcasts } from '@/hooks/useBroadcast';

const BroadcastHistory = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: broadcastsData, isLoading } = useBroadcasts({
    page: currentPage,
    limit: 10,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    type: filterType !== 'all' ? filterType : undefined,
    sortField: 'createdAt',
    sortDirection: 'desc'
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      offer: 'bg-purple-100 text-purple-800',
      festival: 'bg-orange-100 text-orange-800',
      announcement: 'bg-blue-100 text-blue-800',
      promotion: 'bg-green-100 text-green-800',
      newsletter: 'bg-indigo-100 text-indigo-800',
      reminder: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDeliveryRate = (broadcast) => {
    if (broadcast.stats.totalRecipients === 0) return 0;
    return Math.round((broadcast.stats.deliveredCount / broadcast.stats.totalRecipients) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  const broadcasts = broadcastsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="offer">Offers</SelectItem>
            <SelectItem value="festival">Festival</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="promotion">Promotion</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Broadcast List */}
      <div className="space-y-4">
        {broadcasts.map((broadcast) => (
          <Card key={broadcast._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(broadcast.scheduledAt)}
                    {broadcast.createdBy && (
                      <>
                        • by {broadcast.createdBy.name}
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(broadcast.type)}>
                    {broadcast.type}
                  </Badge>
                  <Badge className={getStatusColor(broadcast.status)}>
                    {broadcast.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Description */}
              {broadcast.description && (
                <p className="text-gray-600 mb-4">{broadcast.description}</p>
              )}

              {/* Channels */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Channels:</span>
                {broadcast.channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="flex items-center gap-1">
                    {channel === 'email' ? (
                      <Mail className="h-3 w-3" />
                    ) : (
                      <MessageSquare className="h-3 w-3" />
                    )}
                    {channel}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {broadcast.stats.totalRecipients}
                  </div>
                  <div className="text-xs text-gray-500">Recipients</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {broadcast.stats.sentCount}
                  </div>
                  <div className="text-xs text-blue-600">Sent</div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {broadcast.stats.deliveredCount}
                  </div>
                  <div className="text-xs text-green-600">Delivered</div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-900">
                    {broadcast.stats.failedCount}
                  </div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
              </div>

              {/* Delivery Rate */}
              {broadcast.status === 'sent' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Delivery Rate</span>
                    <span className="text-sm font-medium">
                      {calculateDeliveryRate(broadcast)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateDeliveryRate(broadcast)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                {broadcast.status === 'draft' && (
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                )}
                {broadcast.status === 'failed' && (
                  <Button size="sm" variant="outline">
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {broadcastsData?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {broadcastsData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, broadcastsData.totalPages))}
            disabled={currentPage === broadcastsData.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {broadcasts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts found</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your filters to see more broadcasts.'
              : 'Create your first broadcast to start engaging with your clients.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BroadcastHistory;
