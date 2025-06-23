
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useEnhancedBroadcasts, useApproveBroadcast } from '@/hooks/useEnhancedBroadcastSystem';

const BroadcastApproval = () => {
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: pendingBroadcasts } = useEnhancedBroadcasts({ 
    status: 'pending_approval',
    limit: 20 
  });
  
  const { data: approvedBroadcasts } = useEnhancedBroadcasts({ 
    status: 'approved',
    limit: 20 
  });
  
  const { data: rejectedBroadcasts } = useEnhancedBroadcasts({ 
    status: 'rejected',
    limit: 20 
  });

  const approveBroadcast = useApproveBroadcast();

  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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
      reminder: 'bg-yellow-100 text-yellow-800',
      birthday: 'bg-pink-100 text-pink-800',
      anniversary: 'bg-cyan-100 text-cyan-800'
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

  const handleApproval = (broadcast, action) => {
    setSelectedBroadcast(broadcast);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const submitApproval = () => {
    if (!selectedBroadcast) return;

    approveBroadcast.mutate({
      broadcastId: selectedBroadcast._id,
      action: approvalAction,
      reason: approvalReason
    }, {
      onSuccess: () => {
        setShowApprovalDialog(false);
        setSelectedBroadcast(null);
        setApprovalReason('');
      }
    });
  };

  const renderBroadcastCard = (broadcast) => (
    <Card key={broadcast._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{broadcast.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4" />
              Created by {broadcast.createdBy?.name || 'Unknown'}
              <Calendar className="h-4 w-4 ml-2" />
              {formatDate(broadcast.createdAt)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeColor(broadcast.type)}>
              {broadcast.type}
            </Badge>
            <Badge className={getStatusColor(broadcast.approval?.status || broadcast.status)}>
              {broadcast.approval?.status || broadcast.status}
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
            <Badge key={channel} variant="outline" className="text-xs">
              {channel}
            </Badge>
          ))}
        </div>

        {/* Target Audience Summary */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Target Audience</h4>
          <div className="text-sm text-gray-600">
            {broadcast.targetAudience?.allClients ? (
              <span>All clients</span>
            ) : (
              <div className="space-y-1">
                {broadcast.targetAudience?.clientTypes?.length > 0 && (
                  <div>Client Types: {broadcast.targetAudience.clientTypes.join(', ')}</div>
                )}
                {broadcast.targetAudience?.tierLevels?.length > 0 && (
                  <div>Tier Levels: {broadcast.targetAudience.tierLevels.join(', ')}</div>
                )}
                {broadcast.targetAudience?.locations?.length > 0 && (
                  <div>Locations: {broadcast.targetAudience.locations.map(l => `${l.city}, ${l.state}`).join('; ')}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Content Preview</h4>
          {broadcast.channelConfigs?.email?.subject && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">Subject:</span>
              <p className="text-sm">{broadcast.channelConfigs.email.subject}</p>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500">Content:</span>
            <p className="text-sm line-clamp-3">{broadcast.content}</p>
          </div>
        </div>

        {/* A/B Testing Info */}
        {broadcast.abTest?.enabled && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium mb-2">A/B Testing Enabled</h4>
            <p className="text-sm text-gray-600">
              {broadcast.abTest.variants?.length || 0} variants configured
            </p>
          </div>
        )}

        {/* Campaign Info */}
        {broadcast.campaign?.name && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Campaign Information</h4>
            <div className="text-sm text-gray-600">
              <div>Campaign: {broadcast.campaign.name}</div>
              {broadcast.campaign.budget > 0 && (
                <div>Budget: ₹{broadcast.campaign.budget}</div>
              )}
            </div>
          </div>
        )}

        {/* Compliance Warnings */}
        {(!broadcast.compliance?.regulatoryApproved || !broadcast.compliance?.legalReviewed) && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Compliance Review Required</h4>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              {!broadcast.compliance?.regulatoryApproved && (
                <div>• Regulatory approval pending</div>
              )}
              {!broadcast.compliance?.legalReviewed && (
                <div>• Legal review pending</div>
              )}
            </div>
          </div>
        )}

        {/* Approval History */}
        {broadcast.approval?.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium mb-2 text-red-800">Previous Rejection Reason</h4>
            <p className="text-sm text-red-700">{broadcast.approval.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBroadcast(broadcast);
              // Show detailed view modal
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {broadcast.status === 'pending_approval' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApproval(broadcast, 'approve')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleApproval(broadcast, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Pending Approval</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingBroadcasts?.pagination?.totalItems || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Approved</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {approvedBroadcasts?.pagination?.totalItems || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Rejected</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {rejectedBroadcasts?.pagination?.totalItems || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different approval statuses */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingBroadcasts?.pagination?.totalItems || 0})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedBroadcasts?.pagination?.totalItems || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedBroadcasts?.pagination?.totalItems || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBroadcasts?.data?.length > 0 ? (
            pendingBroadcasts.data.map(renderBroadcastCard)
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
              <p className="text-gray-500">All broadcasts have been reviewed.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedBroadcasts?.data?.length > 0 ? (
            approvedBroadcasts.data.map(renderBroadcastCard)
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved broadcasts</h3>
              <p className="text-gray-500">Approved broadcasts will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedBroadcasts?.data?.length > 0 ? (
            rejectedBroadcasts.data.map(renderBroadcastCard)
          ) : (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected broadcasts</h3>
              <p className="text-gray-500">Rejected broadcasts will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Broadcast' : 'Reject Broadcast'}
            </DialogTitle>
            <DialogDescription>
              {selectedBroadcast?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-reason">
                {approvalAction === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
              </Label>
              <Textarea
                id="approval-reason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Add any comments about this approval...'
                    : 'Please provide a reason for rejection...'
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitApproval}
                disabled={approveBroadcast.isPending || (approvalAction === 'reject' && !approvalReason.trim())}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalAction === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Broadcast
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Broadcast
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadcastApproval;
