
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Calendar, User, IndianRupee, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';

const PoliciesMobileView = ({ policies, isPolicyDueForRenewal, getStatusBadgeClass }) => {
  const navigate = useNavigate();
  const { hasPermission, isAgent, userId } = usePermissions();
  
  const canEditAnyPolicy = hasPermission('editAnyPolicy');

  const handleViewPolicy = (id) => {
    navigate(`/policies/${id}`);
  };

  const handleEditPolicy = (e, policy) => {
    e.stopPropagation();
    
    // Check permissions
    if (canEditAnyPolicy || (isAgent() && policy.agentId === userId)) {
      navigate(`/policies/${policy.id}/edit`);
    } else {
      // Show error or disable button - this shouldn't happen if UI is properly controlled
      return;
    }
  };

  const canUserEditPolicy = (policy) => {
    return canEditAnyPolicy || (isAgent() && policy.agentId === userId);
  };

  if (!policies || policies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {isAgent() ? 'No policies assigned to you' : 'No policies found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {policies.map((policy) => (
        <Card key={policy.id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {policy.policyNumber}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusBadgeClass(policy.status)}>
                    {policy.status}
                  </Badge>
                  {isPolicyDueForRenewal(policy.endDate) && (
                    <Badge variant="warning" className="bg-orange-100 text-orange-800">
                      Renewal Due
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleViewPolicy(policy.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canUserEditPolicy(policy) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleEditPolicy(e, policy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{policy.client.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{policy.insuranceCompany || 'Not specified'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  Expires: {new Date(policy.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 font-medium">
                  ₹{parseInt(policy.premium).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{policy.type}</span>
                <span>{policy.planName || 'Standard Plan'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PoliciesMobileView;
