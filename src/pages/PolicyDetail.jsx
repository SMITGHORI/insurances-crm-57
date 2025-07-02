
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PolicyDetailTabs from '@/components/policies/PolicyDetailTabs';
import { usePolicy } from '@/hooks/usePolicies';

const PolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: policy, isLoading, error } = usePolicy(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Not Found</h2>
          <p className="text-gray-600 mb-4">The requested policy could not be found in the database.</p>
          <Button onClick={() => navigate('/policies')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Policies
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
          onClick={() => navigate('/policies')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Policies
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {policy.policyNumber || 'Policy Details'}
          </h1>
          <p className="text-gray-600">
            Connected to MongoDB • Complete policy information and management
          </p>
        </div>
      </div>

      <PolicyDetailTabs policy={policy} />
    </div>
  );
};

export default PolicyDetail;
