
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PolicyForm from '../components/policies/PolicyForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePermissions } from '@/contexts/PermissionsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const PolicyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();
  const { hasPermission, isAgent, userId } = usePermissions();

  // Check permissions
  const canEditAnyPolicy = hasPermission('editAnyPolicy');
  const canDeletePolicy = hasPermission('deletePolicy');

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
      // Check if agent can edit this specific policy
      if (isAgent() && !canEditAnyPolicy && foundPolicy.agentId !== userId) {
        toast.error('You do not have permission to edit this policy');
        navigate('/policies');
        return;
      }
      
      // If typeSpecificDetails doesn't exist yet, initialize it
      if (!foundPolicy.typeSpecificDetails) {
        foundPolicy.typeSpecificDetails = {};
      }
      
      setPolicy(foundPolicy);
    } else {
      toast.error(`Policy with ID ${id} not found`);
      navigate('/policies');
    }
    
    setLoading(false);
  }, [id, navigate, isAgent, canEditAnyPolicy, userId]);

  const handleSavePolicy = async (updatedPolicy) => {
    setSubmitting(true);
    
    try {
      // Additional permission check
      if (isAgent() && !canEditAnyPolicy && policy.agentId !== userId) {
        toast.error('You do not have permission to edit this policy');
        setSubmitting(false);
        return;
      }
      
      // Validate required fields
      if (!updatedPolicy.client?.id || !updatedPolicy.type || !updatedPolicy.premium || !updatedPolicy.sumAssured) {
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
      
      // Find the index of the policy to update
      const policyIndex = policiesList.findIndex(p => p.id === updatedPolicy.id);
      
      if (policyIndex !== -1) {
        // Preserve existing fields that aren't in the form
        const existingPolicy = policiesList[policyIndex];
        const fieldsToPreserve = ['renewals', 'documents', 'payments', 'history', 'notes', 'agentId', 'assignedAgent'];
        
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
          by: isAgent() ? 'Agent' : 'Admin',
          timestamp: new Date().toISOString(),
          details: 'Policy details updated'
        });
        
        // Ensure typeSpecificDetails exists
        if (!updatedPolicy.typeSpecificDetails) {
          updatedPolicy.typeSpecificDetails = {};
        }
        
        // Update the policy in the array
        policiesList[policyIndex] = updatedPolicy;
        
        // Save updated policies list back to localStorage
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
        
        toast.success(`Policy ${updatedPolicy.policyNumber} updated successfully`);
        navigate(`/policies/${updatedPolicy.id}`);
      } else {
        toast.error('Policy not found for update');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeletePolicy = () => {
    try {
      // Check permission
      if (!canDeletePolicy) {
        toast.error('You do not have permission to delete policies');
        return;
      }
      
      // Additional check for agents
      if (isAgent() && policy.agentId !== userId) {
        toast.error('You can only delete policies assigned to you');
        return;
      }
      
      // Get current policies from localStorage
      const storedPoliciesData = localStorage.getItem('policiesData');
      
      if (storedPoliciesData) {
        let policiesList = JSON.parse(storedPoliciesData);
        
        // Filter out the policy to delete
        policiesList = policiesList.filter(p => p.id !== parseInt(id));
        
        // Save updated policies list back to localStorage
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
        
        toast.success('Policy deleted successfully');
        navigate('/policies');
      } else {
        toast.error('No policies found');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    }
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Check if user has permission to edit this policy
  const canEdit = canEditAnyPolicy || (isAgent() && policy?.agentId === userId);
  const canDelete = canDeletePolicy && (canEditAnyPolicy || (isAgent() && policy?.agentId === userId));

  if (!canEdit) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You do not have permission to edit this policy.</p>
            <Button onClick={() => navigate('/policies')} variant="outline">
              Back to Policies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 -ml-2 text-gray-600 hover:text-gray-900"
            onClick={() => navigate(`/policies/${id}`)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to policy
          </Button>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isMobile ? 'Edit Policy' : `Edit Policy: ${policy.policyNumber}`}
          </h1>
        </div>
        
        {canDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center"
          >
            <Trash className="mr-1 h-4 w-4" />
            Delete Policy
          </Button>
        )}
      </div>
      
      <PolicyForm 
        policy={policy} 
        onSave={handleSavePolicy} 
        clients={clients} 
        isSubmitting={submitting}
      />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePolicy}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PolicyEdit;
