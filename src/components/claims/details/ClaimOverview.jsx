
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, User, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';

const ClaimOverview = ({ claim }) => {
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

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return <Badge className={priorityColors[priority] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Claim Summary
            <div className="flex space-x-2">
              {getStatusBadge(claim.status)}
              {getPriorityBadge(claim.priority)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Claim Amount</span>
              </div>
              <p className="text-2xl font-bold">₹{claim.claimAmount?.toLocaleString() || '0'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Approved Amount</span>
              </div>
              <p className="text-2xl font-bold">₹{claim.approvedAmount?.toLocaleString() || '0'}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Incident Date</span>
              </div>
              <p className="text-lg font-medium">
                {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Claim Number</span>
              <p className="font-medium">{claim.claimNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Claim Type</span>
              <p className="font-medium">{claim.claimType || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Description</span>
              <p className="text-sm">{claim.description || 'No description provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Deductible</span>
              <p className="font-medium">₹{claim.deductible?.toLocaleString() || '0'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.contactDetails && (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{claim.contactDetails.primaryContact || 'N/A'}</span>
                </div>
                {claim.contactDetails.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{claim.contactDetails.phoneNumber}</span>
                  </div>
                )}
                {claim.contactDetails.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{claim.contactDetails.email}</span>
                  </div>
                )}
              </>
            )}
            {claim.incidentLocation && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div className="text-sm">
                  {claim.incidentLocation.address && <p>{claim.incidentLocation.address}</p>}
                  {(claim.incidentLocation.city || claim.incidentLocation.state) && (
                    <p>{claim.incidentLocation.city}, {claim.incidentLocation.state}</p>
                  )}
                  {claim.incidentLocation.zipCode && <p>{claim.incidentLocation.zipCode}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settlement Information */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-600">Estimated Settlement</span>
              <p className="font-medium">
                {claim.estimatedSettlement 
                  ? new Date(claim.estimatedSettlement).toLocaleDateString()
                  : 'Not set'
                }
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Actual Settlement</span>
              <p className="font-medium">
                {claim.actualSettlement 
                  ? new Date(claim.actualSettlement).toLocaleDateString()
                  : 'Pending'
                }
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Days Since Reported</span>
              <p className="font-medium">
                {claim.reportedDate 
                  ? Math.floor((Date.now() - new Date(claim.reportedDate)) / (1000 * 60 * 60 * 24))
                  : 0
                } days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimOverview;
