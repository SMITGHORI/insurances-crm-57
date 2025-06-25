
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ClaimStatus = ({ claimId }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  const statusOptions = [
    { value: 'Reported', label: 'Reported', icon: AlertCircle, color: 'blue' },
    { value: 'Under Review', label: 'Under Review', icon: Clock, color: 'yellow' },
    { value: 'Pending', label: 'Pending', icon: Clock, color: 'orange' },
    { value: 'Approved', label: 'Approved', icon: CheckCircle, color: 'green' },
    { value: 'Rejected', label: 'Rejected', icon: XCircle, color: 'red' },
    { value: 'Settled', label: 'Settled', icon: CheckCircle, color: 'purple' },
    { value: 'Closed', label: 'Closed', icon: CheckCircle, color: 'gray' }
  ];

  const getCurrentStatus = () => {
    return statusOptions.find(status => status.value === 'Under Review') || statusOptions[0];
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Reported': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Settled': 'bg-purple-100 text-purple-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const handleStatusUpdate = () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    if (selectedStatus === 'Approved' && !approvedAmount) {
      toast.error('Please enter approved amount');
      return;
    }

    toast.success(`Claim status updated to ${selectedStatus}`);
    setSelectedStatus('');
    setReason('');
    setApprovedAmount('');
  };

  const currentStatus = getCurrentStatus();
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Claim Status Management</h3>
        <p className="text-sm text-gray-600">Update and track claim status changes</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {getStatusBadge(currentStatus.value)}
              <p className="text-sm text-gray-600 mt-2">
                Last updated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Days in current status</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Status */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <status.icon className="h-4 w-4" />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus === 'Approved' && (
            <div>
              <label className="block text-sm font-medium mb-2">Approved Amount</label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="Enter approved amount"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for status change"
              rows={3}
            />
          </div>

          <Button onClick={handleStatusUpdate} className="w-full">
            Update Status
          </Button>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { status: 'Under Review', date: '2024-01-18', reason: 'Initial review started' },
              { status: 'Reported', date: '2024-01-15', reason: 'Claim reported by client' }
            ].map((entry, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    {getStatusBadge(entry.status)}
                    <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{entry.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimStatus;
