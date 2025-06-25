
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const PolicyOverview = ({ policy }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const isExpiringSoon = () => {
    if (!policy.endDate) return false;
    const endDate = new Date(policy.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-xl">{policy.policyNumber}</CardTitle>
                <p className="text-gray-600">{policy.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(policy.status)}
              {isExpiringSoon() && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertTriangle size={12} className="mr-1" />
                  Expiring Soon
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Policy Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>Premium: ₹{policy.premium?.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>Sum Assured: ₹{policy.sumAssured?.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Start Date: {new Date(policy.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>End Date: {new Date(policy.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Client Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{policy.client?.name || 'Unknown Client'}</span>
                </div>
                {policy.agent && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Agent: {policy.agent.name}</span>
                  </div>
                )}
                {policy.paymentFrequency && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Payment: {policy.paymentFrequency}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ₹{policy.premium?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Annual Premium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{policy.sumAssured?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Sum Assured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {policy.claims || 0}
            </div>
            <div className="text-sm text-gray-600">Claims Filed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {policy.documents || 0}
            </div>
            <div className="text-sm text-gray-600">Documents</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PolicyOverview;
