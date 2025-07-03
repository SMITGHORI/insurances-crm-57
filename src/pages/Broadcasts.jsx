
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Send, BarChart, Download, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useBroadcasts, useDeleteBroadcast, useSendBroadcast, useExportBroadcasts } from '@/hooks/useBroadcast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

const Broadcasts = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // MongoDB-connected hooks
  const { data: broadcastsResponse, isLoading, error } = useBroadcasts({
    page,
    limit,
    search: searchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortField: 'createdAt',
    sortDirection: 'desc'
  });

  const deleteBroadcastMutation = useDeleteBroadcast();
  const sendBroadcastMutation = useSendBroadcast();
  const exportBroadcastsMutation = useExportBroadcasts();

  const broadcasts = broadcastsResponse?.data || [];
  const pagination = {
    currentPage: broadcastsResponse?.currentPage || 1,
    totalPages: broadcastsResponse?.totalPages || 1,
    total: broadcastsResponse?.total || 0
  };

  const handleCreateBroadcast = () => {
    navigate('/broadcasts/create');
  };

  const handleEditBroadcast = (broadcastId) => {
    navigate(`/broadcasts/edit/${broadcastId}`);
  };

  const handleViewBroadcast = (broadcastId) => {
    navigate(`/broadcasts/${broadcastId}`);
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    try {
      console.log('Deleting broadcast from MongoDB:', broadcastId);
      await deleteBroadcastMutation.mutateAsync(broadcastId);
    } catch (error) {
      console.error('Error deleting broadcast from MongoDB:', error);
    }
  };

  const handleSendBroadcast = async (broadcastId) => {
    try {
      console.log('Sending broadcast via MongoDB:', broadcastId);
      await sendBroadcastMutation.mutateAsync(broadcastId);
    } catch (error) {
      console.error('Error sending broadcast via MongoDB:', error);
    }
  };

  const handleExport = async () => {
    try {
      console.log('Exporting broadcasts from MongoDB');
      await exportBroadcastsMutation.mutateAsync({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export broadcasts data from database');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'offer': return 'bg-orange-100 text-orange-800';
      case 'festival': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'promotion': return 'bg-green-100 text-green-800';
      case 'newsletter': return 'bg-indigo-100 text-indigo-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Broadcasts</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Broadcasts Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Real-time database operations • {pagination.total} total broadcasts
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={exportBroadcastsMutation.isLoading}
            className={isMobile ? "w-full" : ""}
          >
            <Download className="mr-2 h-4 w-4" /> 
            {exportBroadcastsMutation.isLoading ? 'Exporting...' : 'Export'}
          </Button>
          
          <Button onClick={handleCreateBroadcast} className={isMobile ? "w-full" : ""}>
            <Plus className="mr-2 h-4 w-4" /> Create Broadcast
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search broadcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Broadcasts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((broadcast) => (
                  <TableRow key={broadcast._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{broadcast.title}</p>
                        {broadcast.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {broadcast.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(broadcast.type)}>
                        {broadcast.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(broadcast.status)}>
                        {broadcast.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {broadcast.channels?.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{broadcast.stats?.totalRecipients || 0} total</p>
                        <p className="text-gray-500">{broadcast.stats?.sentCount || 0} sent</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {broadcast.scheduledAt ? formatDate(broadcast.scheduledAt) : 'Not scheduled'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-md">
                          <DropdownMenuItem onClick={() => handleViewBroadcast(broadcast._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBroadcast(broadcast._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {broadcast.status === 'draft' || broadcast.status === 'scheduled' ? (
                            <DropdownMenuItem 
                              onClick={() => handleSendBroadcast(broadcast._id)}
                              disabled={sendBroadcastMutation.isLoading}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </DropdownMenuItem>
                          ) : null}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Broadcast</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this broadcast? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialögCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBroadcast(broadcast._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteBroadcastMutation.isLoading}
                                >
                                  {deleteBroadcastMutation.isLoading ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {broadcasts.length === 0 && (
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No broadcasts match your current filters.'
                  : 'Create your first broadcast to start communicating with clients.'
                }
              </p>
              <Button onClick={handleCreateBroadcast}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Broadcast
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * limit + 1} to {Math.min(pagination.currentPage * limit, pagination.total)} of {pagination.total} broadcasts
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Broadcasts;
