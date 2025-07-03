
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCreateClaim, usePoliciesForClaim, useClientsForClaim, usePolicyDetailsForClaim } from '../hooks/useClaims';

const ClaimCreate = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Connect to MongoDB for form data
  const { data: policiesResponse = [], isLoading: policiesLoading } = usePoliciesForClaim();
  const { data: clientsResponse = [], isLoading: clientsLoading } = useClientsForClaim();
  
  // Connect to MongoDB for claim creation
  const createClaimMutation = useCreateClaim();

  const [formData, setFormData] = useState({
    clientId: '',
    policyId: '',
    claimType: '',
    priority: 'Medium',
    claimAmount: '',
    deductible: '',
    incidentDate: '',
    description: '',
    assignedTo: '',
    estimatedSettlement: '',
    incidentLocation: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contactDetails: {
      primaryContact: '',
      phoneNumber: '',
      email: ''
    }
  });

  // Get policy details when policy is selected
  const { data: policyDetails } = usePolicyDetailsForClaim(formData.policyId);

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
    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!formData.policyId) {
      toast.error("Please select a policy");
      return;
    }
    if (!formData.claimType) {
      toast.error("Please select claim type");
      return;
    }
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
      // Prepare claim data for MongoDB
      const claimData = {
        clientId: formData.clientId,
        policyId: formData.policyId,
        claimType: formData.claimType,
        priority: formData.priority,
        claimAmount: parseFloat(formData.claimAmount),
        deductible: formData.deductible ? parseFloat(formData.deductible) : 0,
        incidentDate: formData.incidentDate,
        description: formData.description,
        assignedTo: formData.assignedTo || null,
        estimatedSettlement: formData.estimatedSettlement || null,
        incidentLocation: formData.incidentLocation,
        contactDetails: formData.contactDetails
      };

      console.log('Creating claim in MongoDB:', claimData);
      
      // Create the claim in MongoDB
      const result = await createClaimMutation.mutateAsync(claimData);
      console.log('Claim created successfully in MongoDB:', result);
      
      // Navigate to the created claim detail page
      navigate(`/claims/${result._id || result.id}`);
    } catch (error) {
      console.error('Error creating claim in MongoDB:', error);
      toast.error('Failed to create claim in database. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/claims');
  };

  // Show professional loading skeleton
  if (policiesLoading || clientsLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="p-0 h-8 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Claims
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Claim</h1>
          <div className="text-gray-500">
            Connected to MongoDB • Claim will be saved to database
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter basic claim details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleSelectChange('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsResponse.map((client) => (
                      <SelectItem key={client._id || client.id} value={client._id || client.id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="policyId">Policy *</Label>
                <Select value={formData.policyId} onValueChange={(value) => handleSelectChange('policyId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policiesResponse.map((policy) => (
                      <SelectItem key={policy._id || policy.id} value={policy._id || policy.id}>
                        {policy.policyNumber} - {policy.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claimType">Claim Type *</Label>
                <Select value={formData.claimType} onValueChange={(value) => handleSelectChange('claimType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Life">Life</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Disability">Disability</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Incident Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="incidentDate"
                    name="incidentDate"
                    type="date"
                    value={formData.incidentDate}
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
                  value={formData.claimAmount}
                  onChange={handleInputChange}
                  placeholder="Enter claim amount"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deductible">Deductible</Label>
                <Input
                  id="deductible"
                  name="deductible"
                  type="number"
                  value={formData.deductible}
                  onChange={handleInputChange}
                  placeholder="Enter deductible amount"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedSettlement">Estimated Settlement Date</Label>
                <Input
                  id="estimatedSettlement"
                  name="estimatedSettlement"
                  type="date"
                  value={formData.estimatedSettlement}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Claim Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed description of the incident"
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Incident Location */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Location</CardTitle>
            <CardDescription>Where did the incident occur?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="incidentLocation.address">Address</Label>
                <Input
                  id="incidentLocation.address"
                  name="incidentLocation.address"
                  value={formData.incidentLocation.address}
                  onChange={handleInputChange}
                  placeholder="Enter incident address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentLocation.city">City</Label>
                <Input
                  id="incidentLocation.city"
                  name="incidentLocation.city"
                  value={formData.incidentLocation.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentLocation.state">State</Label>
                <Input
                  id="incidentLocation.state"
                  name="incidentLocation.state"
                  value={formData.incidentLocation.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Primary contact for this claim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactDetails.primaryContact">Primary Contact</Label>
                <Input
                  id="contactDetails.primaryContact"
                  name="contactDetails.primaryContact"
                  value={formData.contactDetails.primaryContact}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactDetails.phoneNumber">Phone Number</Label>
                <Input
                  id="contactDetails.phoneNumber"
                  name="contactDetails.phoneNumber"
                  value={formData.contactDetails.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactDetails.email">Email</Label>
                <Input
                  id="contactDetails.email"
                  name="contactDetails.email"
                  type="email"
                  value={formData.contactDetails.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createClaimMutation.isLoading}
          >
            {createClaimMutation.isLoading ? 'Creating...' : 'Create Claim'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClaimCreate;
