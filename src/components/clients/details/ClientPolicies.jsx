
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientPolicies = ({ clientId }) => {
  const navigate = useNavigate();
  
  const policies = [
    {
      id: '1',
      policyNumber: 'POL001',
      type: 'Life Insurance',
      premium: 25000,
      sumAssured: 1000000,
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2025-01-15'
    },
    {
      id: '2',
      policyNumber: 'POL002',
      type: 'Health Insurance',
      premium: 15000,
      sumAssured: 500000,
      status: 'Active',
      startDate: '2024-02-01',
      endDate: '2025-02-01'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Client Policies</h3>
          <p className="text-sm text-gray-600">All policies associated with this client</p>
        </div>
        <Button onClick={() => navigate('/policies/new')}>
          <Plus size={16} className="mr-2" />
          New Policy
        </Button>
      </div>

      <div className="grid gap-4">
        {policies.map(policy => (
          <Card key={policy.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/policies/${policy.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{policy.policyNumber}</h4>
                    <p className="text-sm text-gray-500">{policy.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(policy.status)}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>Premium: ₹{policy.premium.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>Sum: ₹{policy.sumAssured.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Expires: {new Date(policy.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {policies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
            <p className="text-gray-500">Create the first policy for this client</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPolicies;
