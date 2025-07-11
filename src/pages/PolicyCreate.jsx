
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyForm from '../components/policies/PolicyForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useCreatePolicy } from '../hooks/usePolicies';
import { useClients } from '../hooks/useClients';

const PolicyCreate = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Connect to MongoDB for clients data
  const { data: clientsResponse, isLoading: clientsLoading } = useClients({ limit: 1000 });
  const clients = clientsResponse?.data || [];
  
  // Connect to MongoDB for policy creation
  const createPolicyMutation = useCreatePolicy();

  console.log('PolicyCreate - clients from MongoDB:', clients);

  const handleSavePolicy = async (newPolicy) => {
    try {
      console.log('Creating policy in MongoDB:', newPolicy);
      
      // Validate required fields
      if (!newPolicy.clientId || !newPolicy.type || !newPolicy.premium || !newPolicy.sumAssured) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Prepare policy data for MongoDB
      const policyData = {
        clientId: newPolicy.clientId,
        type: newPolicy.type,
        category: newPolicy.category || 'individual',
        insuranceCompany: newPolicy.insuranceCompany,
        planName: newPolicy.planName,
        sumAssured: parseFloat(newPolicy.sumAssured),
        premium: parseFloat(newPolicy.premium),
        paymentFrequency: newPolicy.paymentFrequency || 'yearly',
        startDate: newPolicy.startDate,
        endDate: newPolicy.endDate,
        maturityDate: newPolicy.maturityDate,
        status: newPolicy.status || 'Proposal',
        gracePeriod: parseInt(newPolicy.gracePeriod) || 30,
        policyTermYears: newPolicy.policyTermYears ? parseInt(newPolicy.policyTermYears) : undefined,
        premiumPaymentTermYears: newPolicy.premiumPaymentTermYears ? parseInt(newPolicy.premiumPaymentTermYears) : undefined,
        lockInPeriod: parseInt(newPolicy.lockInPeriod) || 0,
        gstNumber: newPolicy.gstNumber || '',
        discountPercentage: parseFloat(newPolicy.discountPercentage) || 0,
        nextYearPremium: newPolicy.nextYearPremium ? parseFloat(newPolicy.nextYearPremium) : undefined,
        assignedAgentId: newPolicy.assignedAgentId,
        nominees: newPolicy.nominees || [],
        typeSpecificDetails: newPolicy.typeSpecificDetails || {},
        vehicleDetails: newPolicy.vehicleDetails,
        healthDetails: newPolicy.healthDetails,
        travelDetails: newPolicy.travelDetails,
        commission: newPolicy.commission,
        source: newPolicy.source || 'direct'
      };
      
      // Create the policy in MongoDB
      const result = await createPolicyMutation.mutateAsync(policyData);
      console.log('Policy created successfully in MongoDB:', result);
      
      toast.success('Policy created successfully in database');
      
      // Navigate to the created policy detail page
      navigate(`/policies/${result._id || result.id}`);
    } catch (error) {
      console.error('Error creating policy in MongoDB:', error);
      toast.error(`Failed to create policy in database: ${error.message}`);
    }
  };

  // Show professional loading skeleton
  if (clientsLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  const emptyPolicy = {
    status: 'Proposal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    gracePeriod: 30,
    paymentFrequency: 'yearly',
    sumAssured: '',
    premium: '',
    type: '',
    category: 'individual',
    insuranceCompany: '',
    planName: '',
    lockInPeriod: 0,
    discountPercentage: 0,
    gstNumber: '',
    nextYearPremium: '',
    clientId: '',
    assignedAgentId: '',
    typeSpecificDetails: {},
    source: 'direct'
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate('/policies')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Policies
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Policy</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Policy will be saved to database
          </p>
        </div>
      </div>
      
      <PolicyForm 
        policy={emptyPolicy} 
        onSave={handleSavePolicy} 
        clients={clients} 
        isNew={true}
        isSubmitting={createPolicyMutation.isLoading}
      />
    </div>
  );
};

export default PolicyCreate;
