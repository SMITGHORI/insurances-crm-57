
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const PolicyRenewals = ({ policyId }) => {
  const [renewals, setRenewals] = useState([
    {
      id: '1',
      renewalDate: '2024-01-15',
      expiryDate: '2025-01-15',
      premium: 25000,
      status: 'completed',
      notes: 'Renewed with same terms'
    },
    {
      id: '2',
      renewalDate: '2023-01-15',
      expiryDate: '2024-01-15',
      premium: 24000,
      status: 'completed',
      notes: 'Premium increased by 4%'
    }
  ]);

  const nextRenewalDate = new Date('2025-01-15');
  const today = new Date();
  const daysUntilRenewal = Math.ceil((nextRenewalDate - today) / (1000 * 60 * 60 * 24));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'due':
        return <Badge className="bg-red-100 text-red-800">Due</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleRenewPolicy = () => {
    // In a real application, this would trigger the renewal process
    toast.success('Renewal process initiated');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Policy Renewals</h3>
        <p className="text-sm text-gray-600">Track renewal history and upcoming renewal dates</p>
      </div>

      {/* Next Renewal Alert */}
      <Card className={daysUntilRenewal <= 30 ? 'border-orange-200 bg-orange-50' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {daysUntilRenewal <= 30 ? (
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              ) : (
                <Calendar className="h-8 w-8 text-blue-500" />
              )}
              <div>
                <h4 className="font-medium">Next Renewal Due</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(nextRenewalDate)} ({daysUntilRenewal} days)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {daysUntilRenewal <= 30 && (
                <Badge className="bg-orange-100 text-orange-800">
                  Renewal Due Soon
                </Badge>
              )}
              <Button 
                onClick={handleRenewPolicy}
                className={daysUntilRenewal <= 30 ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                <RefreshCw size={16} className="mr-2" />
                Renew Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal History */}
      <div className="space-y-4">
        <h4 className="font-medium">Renewal History</h4>
        {renewals.map(renewal => (
          <Card key={renewal.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <h5 className="font-medium">
                      Renewed on {formatDate(renewal.renewalDate)}
                    </h5>
                    <p className="text-sm text-gray-600">
                      Valid until {formatDate(renewal.expiryDate)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(renewal.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Premium:</span> ₹{renewal.premium.toLocaleString()}
                </div>
                {renewal.notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {renewal.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {renewals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No renewal history</h3>
            <p className="text-gray-500">Renewal records will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyRenewals;
