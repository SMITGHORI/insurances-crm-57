
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, DollarSign, Calendar, Star, User } from 'lucide-react';

const LeadOverview = ({ lead }) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      'New': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'Converted': 'bg-purple-100 text-purple-800',
      'Lost': 'bg-gray-100 text-gray-800'
    };
    return <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>;
  };

  const getSourceBadge = (source) => {
    const sourceColors = {
      'Website': 'bg-blue-100 text-blue-800',
      'Referral': 'bg-green-100 text-green-800',
      'Cold Call': 'bg-orange-100 text-orange-800',
      'Social Media': 'bg-purple-100 text-purple-800',
      'Event': 'bg-pink-100 text-pink-800',
      'Advertisement': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={sourceColors[source] || 'bg-gray-100 text-gray-800'}>{source}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Lead Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lead Summary
            <div className="flex space-x-2">
              {getStatusBadge(lead.status)}
              {getPriorityBadge(lead.priority)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Lead ID</span>
              </div>
              <p className="text-lg font-bold">{lead.leadId || 'N/A'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <p className="text-lg font-bold">₹{lead.budget?.toLocaleString() || 'Not specified'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Created</span>
              </div>
              <p className="text-lg font-medium">
                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Full Name</span>
              <p className="font-medium text-lg">{lead.name || 'N/A'}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{lead.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{lead.email || 'N/A'}</span>
            </div>
            {lead.address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span className="text-sm">{lead.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Product Interest</span>
              <p className="font-medium">{lead.product || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Source</span>
              <div className="mt-1">
                {getSourceBadge(lead.source)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Assigned To</span>
              <p className="font-medium">{lead.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Additional Information</span>
              <p className="text-sm text-gray-700">{lead.additionalInfo || 'No additional information provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Information */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-600">Next Follow-up</span>
              <p className="font-medium">
                {lead.nextFollowUp 
                  ? new Date(lead.nextFollowUp).toLocaleDateString()
                  : 'Not scheduled'
                }
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Last Interaction</span>
              <p className="font-medium">
                {lead.lastInteraction 
                  ? new Date(lead.lastInteraction).toLocaleDateString()
                  : 'No interactions yet'
                }
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Follow-ups</span>
              <p className="font-medium">{lead.followUps?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lead.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadOverview;
