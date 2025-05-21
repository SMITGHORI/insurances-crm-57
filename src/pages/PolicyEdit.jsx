
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PolicyForm from '../components/policies/PolicyForm';
import { toast } from 'sonner';

const PolicyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Load clients data
    const storedClientsData = localStorage.getItem('clientsData');
    if (storedClientsData) {
      setClients(JSON.parse(storedClientsData));
    }
    
    // Try to get policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    }
    
    // Find the policy by id
    const foundPolicy = policiesList.find(p => p.id === parseInt(id));
    
    if (foundPolicy) {
      setPolicy(foundPolicy);
    } else {
      toast.error(`Policy with ID ${id} not found`);
      navigate('/policies');
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleSavePolicy = (updatedPolicy) => {
    // Get current policies from localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    let policiesList = [];
    
    if (storedPoliciesData) {
      policiesList = JSON.parse(storedPoliciesData);
    }
    
    // Find the index of the policy to update
    const policyIndex = policiesList.findIndex(p => p.id === updatedPolicy.id);
    
    if (policyIndex !== -1) {
      // Preserve existing fields that aren't in the form
      const existingPolicy = policiesList[policyIndex];
      const fieldsToPreserve = ['renewals', 'documents', 'payments', 'history', 'notes'];
      
      fieldsToPreserve.forEach(field => {
        if (existingPolicy[field] && !updatedPolicy[field]) {
          updatedPolicy[field] = existingPolicy[field];
        }
      });
      
      // Add history entry for the update
      if (!updatedPolicy.history) {
        updatedPolicy.history = existingPolicy.history || [];
      }
      
      updatedPolicy.history.push({
        action: 'Updated',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Policy details updated'
      });
      
      // Update the policy in the array
      policiesList[policyIndex] = updatedPolicy;
      
      // Save updated policies list back to localStorage
      localStorage.setItem('policiesData', JSON.stringify(policiesList));
      
      toast.success(`Policy ${updatedPolicy.policyNumber} updated successfully`);
      navigate(`/policies/${updatedPolicy.id}`);
    } else {
      toast.error('Policy not found for update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Policy: {policy.policyNumber}
      </h1>
      <PolicyForm policy={policy} onSave={handleSavePolicy} clients={clients} />
    </div>
  );
};

export default PolicyEdit;
