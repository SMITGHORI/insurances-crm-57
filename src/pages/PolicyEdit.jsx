
import React, { useState } from 'react';
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
import { usePolicy, useUpdatePolicy, useDeletePolicy } from '../hooks/usePolicies';
import { useClients } from '../hooks/useClients';

const PolicyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();
  const { hasPermission, isAgent, userId } = usePermissions();

  // Connect to MongoDB for policy data
  const { data: policy, isLoading: policyLoading, error: policyError } = usePolicy(id);
  
  // Connect to MongoDB for clients data
  const { data: clientsResponse, isLoading: clientsLoading } = useClients({ limit: 1000 });
  const clients = clientsResponse?.data || [];
  
  // Connect to MongoDB for policy operations
  const updatePolicyMutation = useUpdatePolicy();
  const deletePolicyMutation = useDeletePolicy();

  // Check permissions
  const canEditAnyPolicy = hasPermission('editAnyPolicy');
  const canDeletePolicy = hasPermission('deletePolicy');

  const loading = policyLoading || clientsLoading;

  const handleSavePolicy = async (updatedPolicy) => {
    try {
      // Additional permission check
      if (isAgent() && !canEditAnyPolicy && policy.agentId !== userId) {
        toast.error('You do not have permission to edit this policy');
        return;
      }
      
      // Validate required fields
      if (!updatedPolicy.client?.id || !updatedPolicy.type || !updatedPolicy.premium || !updatedPolicy.sumAssured) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      console.log('Updating policy in MongoDB:', { id, updatedPolicy });
      
      // Update the policy in MongoDB
      const result = await updatePolicyMutation.mutateAsync({ id, policyData: updatedPolicy });
      console.log('Policy updated successfully in MongoDB:', result);
      
      toast.success(`Policy updated successfully in database`);
      navigate(`/policies/${id}`);
    } catch (error) {
      console.error('Error updating policy in MongoDB:', error);
      toast.error('Failed to update policy in database. Please try again.');
    }
  };
  
  const handleDeletePolicy = async () => {
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
      
      console.log('Deleting policy from MongoDB:', id);
      
      // Delete the policy from MongoDB
      await deletePolicyMutation.mutateAsync(id);
      console.log('Policy deleted successfully from MongoDB');
      
      toast.success('Policy deleted successfully from database');
      navigate('/policies');
    } catch (error) {
      console.error('Error deleting policy from MongoDB:', error);
      toast.error('Failed to delete policy from database');
    }
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (policyError || !policy) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Policy Not Found</h2>
            <p className="text-gray-600 mb-4">The requested policy could not be found in the database.</p>
            <Button onClick={() => navigate('/policies')} variant="outline">
              Back to Policies
            </Button>
          </div>
        </div>
      </div>
    );
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
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {isMobile ? 'Edit Policy' : `Edit Policy: ${policy.policyNumber}`}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Connected to MongoDB • Changes will be saved to database
            </p>
          </div>
        </div>
        
        {canDelete && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center"
            disabled={deletePolicyMutation.isLoading}
          >
            <Trash className="mr-1 h-4 w-4" />
            {deletePolicyMutation.isLoading ? 'Deleting...' : 'Delete Policy'}
          </Button>
        )}
      </div>
      
      <PolicyForm 
        policy={policy} 
        onSave={handleSavePolicy} 
        clients={clients} 
        isSubmitting={updatePolicyMutation.isLoading}
      />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy from the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePolicy}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deletePolicyMutation.isLoading}
            >
              {deletePolicyMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PolicyEdit;
