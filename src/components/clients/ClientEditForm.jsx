
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const ClientEditForm = ({ client, onSave, documentUploads, onDocumentUpload }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    id: client?.id || 0,
    clientId: client?.clientId || '',
    name: client?.name || '',
    type: client?.type || 'Individual',
    contact: client?.contact || '',
    email: client?.email || '',
    location: client?.location || '',
    policies: client?.policies || 0,
    status: client?.status || 'Active',
    // Individual specific fields
    dob: client?.dob || '',
    gender: client?.gender || '',
    occupation: client?.occupation || '',
    panNumber: client?.panNumber || '',
    // Corporate specific fields
    registrationNo: client?.registrationNo || '',
    gstNumber: client?.gstNumber || '',
    industry: client?.industry || '',
    employeeCount: client?.employeeCount || '',
    contactPerson: client?.contactPerson || '',
    contactPersonDesignation: client?.contactPersonDesignation || '',
    // Common fields
    notes: client?.notes || '',
    assignedAgent: client?.assignedAgent || '',
    createdAt: client?.createdAt || new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCancel = () => {
    navigate('/clients');
  };

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

              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Group">Group</option>
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Email */}
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

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Status */}
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

              {/* Individual-specific fields */}
              {formData.type === 'Individual' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

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
                </>
              )}

              {/* Corporate-specific fields */}
              {formData.type === 'Corporate' && (
                <>
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
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                    <input
                      type="number"
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      name="contactPersonDesignation"
                      value={formData.contactPersonDesignation}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Notes - for all client types */}
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

              {/* Assigned Agent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Agent</label>
                <input
                  type="text"
                  name="assignedAgent"
                  value={formData.assignedAgent}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('documents')}
              >
                Next: Documents
              </Button>
              <Button type="submit">Save Client</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload 
            documentUploads={documentUploads || {}}
            onDocumentUpload={onDocumentUpload}
          />

          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('basic')}
            >
              Back to Basic Info
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
            >
              Save Client
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientEditForm;
