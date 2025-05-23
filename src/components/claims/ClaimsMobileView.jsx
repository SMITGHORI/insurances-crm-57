
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Badge as BadgeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ClaimsMobileView = ({ claims, filterParams, handleExport }) => {
  const navigate = useNavigate();
  
  // Handle claim card click
  const handleClaimClick = (claimId) => {
    navigate(`/claims/${claimId}`);
  };

  // Get appropriate status badge based on claim status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'settled':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Settled</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Withdrawn</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  if (claims.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No claims found matching your search criteria
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {claims.map((claim) => (
        <Card 
          key={claim.id} 
          className="overflow-hidden border border-gray-200 shadow-sm"
          onClick={() => handleClaimClick(claim.id)}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex-1">
                <h3 className="font-medium text-blue-700">{claim.claimNumber}</h3>
                <p className="text-xs text-gray-500">{claim.policyType}</p>
              </div>
              <div>{getStatusBadge(claim.status)}</div>
            </div>
            
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              <div className="p-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-medium">{claim.clientName}</p>
                  <p className="text-xs text-gray-600">Member: {claim.memberName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Policy</p>
                  <p className="text-sm font-medium">{claim.policyNumber}</p>
                  <p className="text-xs font-mono text-gray-500 truncate">{claim.insuranceCompanyPolicyNumber}</p>
                </div>
              </div>
              
              <div className="p-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Incident Date</p>
                  <p className="text-sm">{claim.dateOfIncident}</p>
                </div>
              </div>
              
              <div className="p-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Claim Amount</p>
                  <p className="text-sm font-semibold">{formatCurrency(claim.claimAmount)}</p>
                  {claim.approvedAmount !== null && (
                    <p className={`text-xs ${claim.approvedAmount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                      Approved: {formatCurrency(claim.approvedAmount)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <div className="flex items-center text-blue-600">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{claim.documents}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 text-center text-xs text-blue-600">
                Tap to view details
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {claims.length > 0 && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleExport && handleExport(claims);
            }}
            className="shadow-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClaimsMobileView;
