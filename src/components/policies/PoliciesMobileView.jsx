
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Building, 
  FileText, 
  ArrowRight, 
  Copy, 
  Link
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PoliciesMobileView = ({ policies, isPolicyDueForRenewal, getStatusBadgeClass }) => {
  const navigate = useNavigate();

  if (policies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 px-4">
        <p className="text-base">No policies found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new policy</p>
      </div>
    );
  }

  const handleViewClient = (e, clientId) => {
    e.stopPropagation();
    navigate(`/clients/${clientId}`);
  };

  const handleCopyPolicyNumber = (e, policyNumber) => {
    e.stopPropagation();
    if (policyNumber) {
      navigator.clipboard.writeText(policyNumber);
      toast.success("Policy number copied to clipboard");
    }
  };

  return (
    <div className="p-2 space-y-4">
      {policies.map((policy) => (
        <Card 
          key={policy.id} 
          className="overflow-hidden border-l-4" 
          style={{ 
            borderLeftColor: getPolicyStatusColor(policy.status)
          }}
          onClick={() => navigate(`/policies/${policy.id}`)}
        >
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="max-w-[70%]">
                  <h3 className="font-medium text-base">{policy.policyNumber}</h3>
                  <div className="flex items-center mt-1">
                    <FileText className="h-3 w-3 mr-1 text-gray-500" />
                    <p className="text-xs text-gray-500">{policy.type}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={getStatusBadgeClass(policy.status)}>
                    {policy.status}
                  </Badge>
                  {isPolicyDueForRenewal(policy.endDate) && (
                    <Badge className="amba-badge amba-badge-orange">
                      Renewal due
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-1.5 rounded-full mr-3">
                      <Building className="h-4 w-4 text-blue-600" /> 
                    </div>
                    <span className="text-gray-700">{policy.insuranceCompany || 'Not specified'}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-primary"
                    onClick={(e) => handleCopyPolicyNumber(e, policy.policyNumber)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-50 p-1.5 rounded-full mr-3">
                    <Link className="h-4 w-4 text-green-600" /> 
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm"
                    onClick={(e) => handleViewClient(e, policy.client.id)}
                  >
                    {policy.client.name}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-amber-50 p-1.5 rounded-full mr-3">
                      <Calendar className="h-4 w-4 text-amber-600" /> 
                    </div>
                    <span className="text-gray-700">{new Date(policy.endDate).toLocaleDateString()}</span>
                  </div>
                  <span className="font-medium">₹{parseInt(policy.premium).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-end items-center border-t border-gray-100 pt-3">
                <Button 
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/policies/${policy.id}`);
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get hex color based on status
const getPolicyStatusColor = (status) => {
  switch (status) {
    case 'In Force':
      return '#10b981'; // green-500
    case 'Proposal':
      return '#2563eb'; // blue-600
    case 'Grace':
      return '#f59e0b'; // amber-500
    case 'Lapsed':
    case 'Cancelled':
      return '#ef4444'; // red-500
    case 'Surrendered':
    case 'Matured':
      return '#8b5cf6'; // purple-500
    default:
      return '#64748b'; // slate-500
  }
};

export default PoliciesMobileView;
