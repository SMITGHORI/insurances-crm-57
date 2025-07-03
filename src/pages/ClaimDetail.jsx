
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClaimDetailTabs from '@/components/claims/ClaimDetailTabs';
import { useClaim } from '../hooks/useClaims';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Connect to MongoDB for claim data
  const { data: claim, isLoading, error } = useClaim(id);

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (error || !claim) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Not Found</h2>
          <p className="text-gray-600 mb-4">The requested claim could not be found in the database.</p>
          <Button onClick={() => navigate('/claims')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {claim.claimNumber || 'Claim Details'}
          </h1>
          <p className="text-gray-600">
            Connected to MongoDB • Complete claim information and management
          </p>
        </div>
      </div>

      <ClaimDetailTabs claim={claim} />
    </div>
  );
};

export default ClaimDetail;
