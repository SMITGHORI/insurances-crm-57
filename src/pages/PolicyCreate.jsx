
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PolicyForm from '../components/policies/PolicyForm';
import { toast } from 'sonner';
import { generateId } from '@/utils/idGenerator';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const PolicyCreate = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load clients for the dropdown
    const storedClientsData = localStorage.getItem('clientsData');
    if (storedClientsData) {
      setClients(JSON.parse(storedClientsData));
    }
    setLoading(false);
  }, []);

  const handleSavePolicy = async (newPolicy) => {
    setSubmitting(true);
    
    try {
      // Validate required fields
      if (!newPolicy.client?.id || !newPolicy.type || !newPolicy.premium || !newPolicy.sumAssured) {
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
      // Get current policies from localStorage
      const storedPoliciesData = localStorage.getItem('policiesData');
      let policiesList = [];
      
      if (storedPoliciesData) {
        policiesList = JSON.parse(storedPoliciesData);
      }
      
      // Generate a new ID and policy number
      const newId = policiesList.length > 0
        ? Math.max(...policiesList.map(p => p.id)) + 1
        : 1;
      
      const year = new Date().getFullYear();
      const policyNum = generateId('POL', year, newId);
      
      // Create the new policy object with the additional fields
      const completePolicy = {
        ...newPolicy,
        id: newId,
        policyNumber: policyNum,
        renewals: [],
        documents: {
          proposalForm: null,
          policyBond: null,
          welcomeLetter: null,
          policySchedule: null,
        },
        payments: [],
        commission: {
          percentage: newPolicy.commission?.percentage || 0,
          amount: newPolicy.commission?.amount || '0',
          payoutStatus: 'Pending',
          tdsDeducted: '0',
          paymentDate: null
        },
        history: [
          {
            action: 'Created',
            by: 'Admin',
            timestamp: new Date().toISOString(),
            details: `Policy created with status "${newPolicy.status}"`
          }
        ],
        notes: [],
        // Ensure typeSpecificDetails exists even if not provided
        typeSpecificDetails: newPolicy.typeSpecificDetails || {}
      };
      
      // Add the new policy to the list
      policiesList.push(completePolicy);
      
      // Update client's policy count
      const storedClientsData = localStorage.getItem('clientsData');
      if (storedClientsData) {
        const clientsList = JSON.parse(storedClientsData);
        const clientIndex = clientsList.findIndex(c => c.id === newPolicy.client.id);
        
        if (clientIndex !== -1) {
          clientsList[clientIndex].policies = (clientsList[clientIndex].policies || 0) + 1;
          localStorage.setItem('clientsData', JSON.stringify(clientsList));
        }
      }
      
      // Save updated policies list back to localStorage
      localStorage.setItem('policiesData', JSON.stringify(policiesList));
      
      toast.success(`Policy ${policyNum} created successfully`);
      navigate(`/policies/${newId}`);
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const emptyPolicy = {
    status: 'Proposal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    gracePeriod: 30,
    paymentFrequency: 'Annual',
    sumAssured: '',
    premium: '',
    type: '',
    insuranceCompany: '',
    planName: '',
    lockInPeriod: 0,
    discountPercentage: 0,
    gstNumber: '',
    nextYearPremium: '',
    client: { id: '', name: '' },
    typeSpecificDetails: {}
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
        <h1 className="text-2xl font-bold text-gray-800">Create New Policy</h1>
      </div>
      
      <PolicyForm 
        policy={emptyPolicy} 
        onSave={handleSavePolicy} 
        clients={clients} 
        isNew={true}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default PolicyCreate;
