
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClaimDetailTabs from '@/components/claims/ClaimDetailTabs';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock claim data - in real app, this would come from an API call
  const claim = {
    id: id,
    claimNumber: 'CLM-2024-001',
    claimType: 'Auto',
    status: 'Under Review',
    priority: 'High',
    claimAmount: 150000,
    approvedAmount: 0,
    deductible: 10000,
    incidentDate: '2024-01-15',
    reportedDate: '2024-01-16',
    description: 'Vehicle collision on Highway 101, significant damage to front end and engine compartment',
    estimatedSettlement: '2024-02-15',
    contactDetails: {
      primaryContact: 'John Doe',
      phoneNumber: '+91-9876543210',
      email: 'john.doe@email.com'
    },
    incidentLocation: {
      address: '123 Highway 101',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001'
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/claims')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Claims
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {claim.claimNumber}
        </h1>
        <p className="text-gray-600">Complete claim information and management</p>
      </div>

      <ClaimDetailTabs claim={claim} />
    </div>
  );
};

export default ClaimDetail;
