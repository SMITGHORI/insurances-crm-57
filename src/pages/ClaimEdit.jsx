import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ArrowLeft, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClaim, useUpdateClaim, useDeleteClaim, usePoliciesForClaim, useClientsForClaim } from '../hooks/useClaims';
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

const ClaimEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Connect to MongoDB for claim data
  const { data: claim, isLoading: claimLoading, error: claimError } = useClaim(id);
  
  // Connect to MongoDB for form data
  const { data: policiesResponse = [], isLoading: policiesLoading } = usePoliciesForClaim();
  const { data: clientsResponse = [], isLoading: clientsLoading } = useClientsForClaim();
  
  // Connect to MongoDB for claim operations
  const updateClaimMutation = useUpdateClaim();
  const deleteClaimMutation = useDeleteClaim();

  const [formData, setFormData] = useState({});

  // Initialize form data when claim loads
  React.useEffect(() => {
    if (claim) {
      setFormData({
        clientId: claim.clientId?._id || claim.clientId || '',
        policyId: claim.policyId?._id || claim.policyId || '',
        claimType: claim.claimType || '',
        priority: claim.priority || 'Medium',
        claimAmount: claim.claimAmount || '',
        deductible: claim.deductible || '',
        incidentDate: claim.incidentDate ? claim.incidentDate.split('T')[0] : '',
        description: claim.description || '',
        assignedTo: claim.assignedTo?._id || claim.assignedTo || '',
        estimatedSettlement: claim.estimatedSettlement ? claim.estimatedSettlement.split('T')[0] : '',
        status: claim.status || 'Reported',
        approvedAmount: claim.approvedAmount || '',
        incidentLocation: claim.incidentLocation || {
          address: '',
          city: '',
          state: '',
          zipCode: ''
        },
        contactDetails: claim.contactDetails || {
          primaryContact: '',
          phoneNumber: '',
          email: ''
        }
      });
    }
  }, [claim]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.claimAmount) {
      toast.error("Please enter claim amount");
      return;
    }
    if (!formData.incidentDate) {
      toast.error("Please enter incident date");
      return;
    }
    if (!formData.description) {
      toast.error("Please enter claim description");
      return;
    }

    try {
      // Prepare update data for MongoDB
      const updateData = {
        claimType: formData.claimType,
        priority: formData.priority,
        claimAmount: parseFloat(formData.claimAmount),
        deductible: formData.deductible ? parseFloat(formData.deductible) : 0,
        incidentDate: formData.incidentDate,
        description: formData.description,
        assignedTo: formData.assignedTo || null,
        estimatedSettlement: formData.estimatedSettlement || null,
        status: formData.status,
        approvedAmount: formData.approvedAmount ? parseFloat(formData.approvedAmount) : null,
        incidentLocation: formData.incidentLocation,
        contactDetails: formData.contactDetails
      };

      console.log('Updating claim in MongoDB:', { id, updateData });
      
      // Update the claim in MongoDB
      const result = await updateClaimMutation.mutateAsync({ id, claimData: updateData });
      console.log('Claim updated successfully in MongoDB:', result);
      
      // Navigate back to claim detail
      navigate(`/claims/${id}`);
    } catch (error) {
      console.error('Error updating claim in MongoDB:', error);
      toast.error('Failed to update claim in database. Please try again.');
    }
  };

  const handleDeleteClaim = async () => {
    try {
      console.log('Deleting claim from MongoDB:', id);
      
      // Delete the claim from MongoDB
      await deleteClaimMutation.mutateAsync(id);
      console.log('Claim deleted successfully from MongoDB');
      
      // Navigate back to claims list
      navigate('/claims');
    } catch (error) {
      console.error('Error deleting claim from MongoDB:', error);
      toast.error('Failed to delete claim from database');
    }
  };

  const handleCancel = () => {
    navigate(`/claims/${id}`);
  };

  const loading = claimLoading || policiesLoading || clientsLoading;

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (claimError || !claim) {
    return (
      <div className="container mx-auto px-4 py-6">
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="p-0 h-8 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Claim
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Claim</h1>
          <div className="text-gray-500">
            {claim.claimNumber} • Connected to MongoDB • Changes will be saved to database
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center"
          disabled={deleteClaimMutation.isLoading}
        >
          <Trash className="mr-1 h-4 w-4" />
          {deleteClaimMutation.isLoading ? 'Deleting...' : 'Delete Claim'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update basic claim details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimNumber">Claim Number</Label>
                <Input
                  id="claimNumber"
                  value={claim.claimNumber || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Client</Label>
                <Input
                  value={`${claim.clientId?.firstName || ''} ${claim.clientId?.lastName || ''}`.trim() || 'Unknown Client'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Date of Incident *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="incidentDate"
                    name="incidentDate"
                    type="date"
                    value={formData.incidentDate || ''}
                    onChange={handleInputChange}
                    className="pl-10"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount *</Label>
                <Input
                  id="claimAmount"
                  name="claimAmount"
                  type="number"
                  value={formData.claimAmount || ''}
                  onChange={handleInputChange}
                  placeholder="Enter claim amount"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || ''} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reported">Reported</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Settled">Settled</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === 'Approved' || formData.status === 'Settled') && (
                <div className="space-y-2">
                  <Label htmlFor="approvedAmount">Approved Amount</Label>
                  <Input
                    id="approvedAmount"
                    name="approvedAmount"
                    type="number"
                    value={formData.approvedAmount || ''}
                    onChange={handleInputChange}
                    placeholder="Enter approved amount"
                    min="0"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Claim Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Enter detailed description of the incident"
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateClaimMutation.isLoading}
          >
            {updateClaimMutation.isLoading ? 'Updating...' : 'Update Claim'}
          </Button>
        </div>
      </form>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this claim from the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClaim}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteClaimMutation.isLoading}
            >
              {deleteClaimMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimEdit;
