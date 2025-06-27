import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUpdateClient, useUploadDocument } from '../../hooks/useClients';
import { validateClientData, getClientName } from '../../schemas/clientSchemas';
import ProtectedField from '@/components/ProtectedField';

/**
 * Client Edit Form component with backend integration
 * Handles client data updates and document uploads
 */
const ClientEditForm = ({ client, onSave }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  
  // React Query mutations
  const updateClientMutation = useUpdateClient();
  const uploadDocumentMutation = useUploadDocument();

  const [formData, setFormData] = useState({
    _id: client?._id || '',
    clientId: client?.clientId || '',
    clientType: client?.clientType || client?.type?.toLowerCase() || 'individual',
    status: client?.status || 'Active',
    // Individual specific fields
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    dob: client?.dob || '',
    gender: client?.gender || '',
    occupation: client?.occupation || '',
    panNumber: client?.panNumber || '',
    aadharNumber: client?.aadharNumber || '',
    annualIncome: client?.annualIncome || '',
    maritalStatus: client?.maritalStatus || '',
    nomineeName: client?.nomineeName || '',
    nomineeRelation: client?.nomineeRelation || '',
    nomineeContact: client?.nomineeContact || '',
    // Corporate specific fields
    companyName: client?.companyName || client?.name || '',
    registrationNo: client?.registrationNo || '',
    gstNumber: client?.gstNumber || '',
    industry: client?.industry || '',
    employeeCount: client?.employeeCount || '',
    turnover: client?.turnover || '',
    yearEstablished: client?.yearEstablished || '',
    website: client?.website || '',
    contactPersonName: client?.contactPersonName || '',
    contactPersonDesignation: client?.contactPersonDesignation || '',
    contactPersonEmail: client?.contactPersonEmail || '',
    contactPersonPhone: client?.contactPersonPhone || '',
    // Group specific fields
    groupName: client?.groupName || client?.name || '',
    groupType: client?.groupType || '',
    memberCount: client?.memberCount || '',
    primaryContactName: client?.primaryContactName || '',
    relationshipWithGroup: client?.relationshipWithGroup || '',
    registrationID: client?.registrationID || '',
    groupFormationDate: client?.groupFormationDate || '',
    groupCategory: client?.groupCategory || '',
    groupPurpose: client?.groupPurpose || '',
    // Common fields
    email: client?.email || '',
    phone: client?.phone || client?.contact || '',
    altPhone: client?.altPhone || '',
    address: client?.address || client?.location || '',
    city: client?.city || '',
    state: client?.state || '',
    pincode: client?.pincode || '',
    country: client?.country || 'India',
    source: client?.source || '',
    notes: client?.notes || '',
    assignedAgentId: client?.assignedAgentId || '',
  });

  // Update form data when client prop changes
  useEffect(() => {
    if (client) {
      setFormData(prevData => ({
        ...prevData,
        _id: client._id || '',
        clientId: client.clientId || '',
        clientType: client.clientType || client.type?.toLowerCase() || 'individual',
        status: client.status || 'Active',
        // Update other fields as needed
        email: client.email || '',
        phone: client.phone || client.contact || '',
        address: client.address || client.location || '',
        companyName: client.companyName || client.name || '',
        groupName: client.groupName || client.name || '',
      }));
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validation = validateClientData(formData);
      if (!validation.success) {
        const errorMessages = validation.errors.map(err => err.message).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
        return;
      }

      // Update client via API
      await updateClientMutation.mutateAsync({
        id: formData._id || formData.clientId,
        clientData: formData
      });

      // Navigate back to clients page
      navigate('/clients');
    } catch (error) {
      console.error('Failed to update client:', error);
      // Error is already handled in the mutation
    }
  };

  const handleDocumentUpload = async (documentType, file) => {
    if (!file || !client?._id) {
      toast.error('Invalid file or client ID');
      return;
    }

    try {
      await uploadDocumentMutation.mutateAsync({
        clientId: client._id,
        documentType,
        file
      });
    } catch (error) {
      console.error('Failed to upload document:', error);
      // Error is already handled in the mutation
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  const isLoading = updateClientMutation.isLoading;
  const isUploadingDocument = uploadDocumentMutation.isLoading;

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Client</h1>
        <p className="text-gray-600">Update client information and documents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client ID (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  readOnly
                  className="bg-gray-100 w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Protected Status Field */}
              <ProtectedField module="clients" action="edit_status">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </ProtectedField>

              {/* Dynamic fields based on client type */}
              {formData.clientType === 'individual' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  {/* ... keep existing code for other individual fields */}

                  {/* Protected sensitive field - PAN Number */}
                  <ProtectedField module="clients" action="edit" sensitive={true}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </ProtectedField>

                  {/* ... keep existing code for other fields */}
                </>
              )}

              {formData.clientType === 'corporate' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={formData.registrationNo}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select Industry</option>
                      <option value="IT">Information Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {formData.clientType === 'group' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                      type="text"
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
                    <select
                      name="groupType"
                      value={formData.groupType}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select Group Type</option>
                      <option value="family">Family</option>
                      <option value="association">Association</option>
                      <option value="trust">Trust</option>
                      <option value="society">Housing Society</option>
                      <option value="community">Community</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {/* Common fields for all client types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('documents')}
                disabled={isLoading}
              >
                Next: Documents
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Client'}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload 
            documentUploads={client?.documents || {}}
            onDocumentUpload={handleDocumentUpload}
            isUploading={isUploadingDocument}
          />

          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('basic')}
              disabled={isLoading}
            >
              Back to Basic Info
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientEditForm;
