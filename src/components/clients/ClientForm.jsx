import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { generateClientId } from '@/utils/idGenerator';
import { FileUploader } from '@/components/ui/file-uploader';
import ClientAnniversaryForm from './ClientAnniversaryForm';
import { useAuth } from '@/contexts/AuthContext';
import { validateClientData } from '@/schemas/clientSchemas';

const ClientForm = ({ client, onSubmit, onCancel, userRole, userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!client?.id;
  
  // Use userId from props or fallback to authenticated user
  const currentUserId = userId || user?.id;

  // Initialize form data with anniversary and communication preferences
  const [formData, setFormData] = useState({
    clientType: client?.clientType || 'individual',
    name: client?.name || '',
    email: client?.email || '',
    contact: client?.contact || '',
    location: client?.location || '',
    status: client?.status || 'Active',
    dob: client?.dob || '',
    gender: client?.gender || '',
    panNumber: client?.panNumber || '',
    occupation: client?.occupation || '',
    registrationNo: client?.registrationNo || '',
    gstNumber: client?.gstNumber || '',
    industry: client?.industry || '',
    employeeCount: client?.employeeCount || '',
    contactPerson: client?.contactPerson || '',
    contactPersonDesignation: client?.contactPersonDesignation || '',
    groupType: client?.groupType || '',
    memberCount: client?.memberCount || '',
    primaryContact: client?.primaryContact || '',
    primaryContactDesignation: client?.primaryContactDesignation || '',
    notes: client?.notes || '',
    importantDates: client?.importantDates || {},
    communicationPreferences: client?.communicationPreferences || {
      email: { enabled: true, birthday: true, anniversary: true, offers: true },
      whatsapp: { enabled: false, birthday: false, anniversary: false },
      sms: { enabled: false, birthday: false, anniversary: false }
    },
    documents: client?.documents || {}
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle document upload
  const handleDocumentUpload = (docType, file) => {
    if (!file) return;
    
    // In a real app, you would upload the file to a server here
    // For now, we'll just store the file metadata
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      url: URL.createObjectURL(file) // This is temporary and will be lost on page refresh
    };
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: fileData
      }
    }));
    
    toast.success(`${docType} document uploaded successfully`);
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.contact) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      newErrors.contact = 'Contact should be 10 digits';
    }
    if (!formData.location) newErrors.location = 'Location is required';
    
    // Type-specific validation
    if (formData.clientType === 'individual') {
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.panNumber) {
        newErrors.panNumber = 'PAN number is required';
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN format';
      }
    } else if (formData.clientType === 'corporate') {
      if (!formData.registrationNo) newErrors.registrationNo = 'Registration number is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.employeeCount) newErrors.employeeCount = 'Employee count is required';
      if (!formData.contactPerson) newErrors.contactPerson = 'Contact person is required';
    } else if (formData.clientType === 'group') {
      if (!formData.groupType) newErrors.groupType = 'Group type is required';
      if (!formData.memberCount) newErrors.memberCount = 'Member count is required';
      if (!formData.primaryContact) newErrors.primaryContact = 'Primary contact is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse location into address components
      const locationParts = formData.location.split(',').map(part => part.trim());
      const address = locationParts[0] || '';
      const city = locationParts[1] || '';
      const state = locationParts[2] || '';
      const pincode = locationParts[3] || '';
      
      // Prepare base client data
      let clientData = {
        clientType: formData.clientType,
        email: formData.email,
        phone: formData.contact,
        address: address || 'Not provided',
        city: city || 'Not provided',
        state: state || 'Not provided',
        pincode: pincode || '000000',
        country: 'India',
        status: formData.status,
        notes: formData.notes || '',
        assignedAgentId: currentUserId,
        createdBy: currentUserId
      };
      
      // Add client type specific fields in nested structure for MongoDB
      if (formData.clientType === 'individual') {
        const nameParts = formData.name.trim().split(' ');
        clientData.individualData = {
          firstName: nameParts[0] || 'Unknown',
          lastName: nameParts.slice(1).join(' ') || 'User',
          dob: formData.dob ? new Date(formData.dob) : new Date('1990-01-01'),
          gender: formData.gender?.toLowerCase() || 'other',
          panNumber: formData.panNumber || `TEMP${Date.now().toString().slice(-5)}A`,
          occupation: formData.occupation || 'Not specified'
        };
      } else if (formData.clientType === 'corporate') {
        clientData.corporateData = {
          companyName: formData.name,
          registrationNo: formData.registrationNo || '',
          gstNumber: formData.gstNumber || '',
          industry: formData.industry || 'Other',
          employeeCount: parseInt(formData.employeeCount) || 1,
          contactPersonName: formData.contactPerson || '',
          contactPersonDesignation: formData.contactPersonDesignation || '',
          contactPersonEmail: formData.email,
          contactPersonPhone: formData.contact
        };
      } else if (formData.clientType === 'group') {
        clientData.groupData = {
          groupName: formData.name,
          groupType: formData.groupType || 'other',
          memberCount: parseInt(formData.memberCount) || 2,
          primaryContactName: formData.primaryContact || '',
          primaryContactDesignation: formData.primaryContactDesignation || ''
        };
      }
      
      // Add documents if they exist
      if (formData.documents && Object.keys(formData.documents).length > 0) {
        clientData.documents = formData.documents;
      }
      
      // Add communication preferences and important dates
      if (formData.communicationPreferences) {
        clientData.communicationPreferences = formData.communicationPreferences;
      }
      
      if (formData.importantDates && Object.keys(formData.importantDates).length > 0) {
        clientData.importantDates = formData.importantDates;
      }
      
      // Validate data using schema before submission
      try {
        validateClientData(clientData, !isEditMode);
      } catch (validationError) {
        toast.error(`Validation Error: ${validationError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // Submit the form
      await onSubmit(clientData);
      toast.success(isEditMode ? 'Client updated successfully!' : 'Client created successfully!');
      
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit form';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      // Extract data based on client type
      let extractedData = {
        clientType: client.clientType || 'individual',
        email: client.email || '',
        contact: client.phone || client.contact || '',
        location: `${client.address || ''}, ${client.city || ''}, ${client.state || ''}, ${client.pincode || ''}`.replace(/^,\s*|,\s*$/g, ''),
        status: client.status || 'Active',
        notes: client.notes || '',
        importantDates: client.importantDates || {},
        communicationPreferences: client.communicationPreferences || {
          email: { enabled: true, birthday: true, anniversary: true, offers: true },
          whatsapp: { enabled: false, birthday: false, anniversary: false },
          sms: { enabled: false, birthday: false, anniversary: false }
        },
        documents: client.documents || {}
      };
      
      // Extract type-specific data
      if (client.clientType === 'individual' && client.individualData) {
        const { individualData } = client;
        extractedData = {
          ...extractedData,
          name: `${individualData.firstName || ''} ${individualData.lastName || ''}`.trim(),
          dob: individualData.dob ? new Date(individualData.dob).toISOString().split('T')[0] : '',
          gender: individualData.gender ? individualData.gender.charAt(0).toUpperCase() + individualData.gender.slice(1) : '',
          panNumber: individualData.panNumber || '',
          occupation: individualData.occupation || ''
        };
      } else if (client.clientType === 'corporate' && client.corporateData) {
        const { corporateData } = client;
        extractedData = {
          ...extractedData,
          name: corporateData.companyName || '',
          registrationNo: corporateData.registrationNo || '',
          gstNumber: corporateData.gstNumber || '',
          industry: corporateData.industry || '',
          employeeCount: corporateData.employeeCount || '',
          contactPerson: corporateData.contactPersonName || '',
          contactPersonDesignation: corporateData.contactPersonDesignation || ''
        };
      } else if (client.clientType === 'group' && client.groupData) {
        const { groupData } = client;
        extractedData = {
          ...extractedData,
          name: groupData.groupName || '',
          groupType: groupData.groupType || '',
          memberCount: groupData.memberCount || '',
          primaryContact: groupData.primaryContactName || '',
          primaryContactDesignation: groupData.primaryContactDesignation || ''
        };
      }
      
      // Set default values for fields not in extracted data
      const defaultFormData = {
        dob: '',
        gender: '',
        panNumber: '',
        occupation: '',
        registrationNo: '',
        gstNumber: '',
        industry: '',
        employeeCount: '',
        contactPerson: '',
        contactPersonDesignation: '',
        groupType: '',
        memberCount: '',
        primaryContact: '',
        primaryContactDesignation: ''
      };
      
      setFormData({ ...defaultFormData, ...extractedData });
    }
  }, [client]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {isEditMode ? 'Edit Client' : 'Add New Client'}
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientType">Client Type</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => handleSelectChange('clientType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">
                {formData.clientType === 'individual' ? 'Full Name' : 
                 formData.clientType === 'corporate' ? 'Company Name' : 'Group Name'}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={errors.contact ? 'border-red-500' : ''}
                />
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {formData.clientType === 'individual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className={errors.dob ? 'border-red-500' : ''}
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className={errors.panNumber ? 'border-red-500' : ''}
                  />
                  {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.clientType === 'corporate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationNo">Registration Number</Label>
                  <Input
                    id="registrationNo"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    className={errors.registrationNo ? 'border-red-500' : ''}
                  />
                  {errors.registrationNo && <p className="text-red-500 text-sm mt-1">{errors.registrationNo}</p>}
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleSelectChange('industry', value)}
                  >
                    <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                </div>
                <div>
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    name="employeeCount"
                    type="number"
                    value={formData.employeeCount}
                    onChange={handleChange}
                    className={errors.employeeCount ? 'border-red-500' : ''}
                  />
                  {errors.employeeCount && <p className="text-red-500 text-sm mt-1">{errors.employeeCount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={errors.contactPerson ? 'border-red-500' : ''}
                  />
                  {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPersonDesignation">Designation</Label>
                  <Input
                    id="contactPersonDesignation"
                    name="contactPersonDesignation"
                    value={formData.contactPersonDesignation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.clientType === 'group' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupType">Group Type</Label>
                  <Select
                    value={formData.groupType}
                    onValueChange={(value) => handleSelectChange('groupType', value)}
                  >
                    <SelectTrigger className={errors.groupType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select group type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Association">Association</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.groupType && <p className="text-red-500 text-sm mt-1">{errors.groupType}</p>}
                </div>
                <div>
                  <Label htmlFor="memberCount">Number of Members</Label>
                  <Input
                    id="memberCount"
                    name="memberCount"
                    type="number"
                    value={formData.memberCount}
                    onChange={handleChange}
                    className={errors.memberCount ? 'border-red-500' : ''}
                  />
                  {errors.memberCount && <p className="text-red-500 text-sm mt-1">{errors.memberCount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input
                    id="primaryContact"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    className={errors.primaryContact ? 'border-red-500' : ''}
                  />
                  {errors.primaryContact && <p className="text-red-500 text-sm mt-1">{errors.primaryContact}</p>}
                </div>
                <div>
                  <Label htmlFor="primaryContactDesignation">Designation</Label>
                  <Input
                    id="primaryContactDesignation"
                    name="primaryContactDesignation"
                    value={formData.primaryContactDesignation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <ClientAnniversaryForm
            formData={formData}
            setFormData={setFormData}
            clientType={formData.clientType}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>PAN Card</Label>
              <FileUploader
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUpload={(file) => handleDocumentUpload('pan', file)}
                currentFile={formData.documents?.pan}
              />
            </div>
            <div>
              <Label>Aadhaar Card</Label>
              <FileUploader
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUpload={(file) => handleDocumentUpload('aadhaar', file)}
                currentFile={formData.documents?.aadhaar}
              />
            </div>
            <div>
              <Label>ID Proof (Passport/Voter ID)</Label>
              <FileUploader
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUpload={(file) => handleDocumentUpload('idProof', file)}
                currentFile={formData.documents?.idProof}
              />
            </div>
            <div>
              <Label>Address Proof</Label>
              <FileUploader
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onFileUpload={(file) => handleDocumentUpload('addressProof', file)}
                currentFile={formData.documents?.addressProof}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Client' : 'Create Client'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ClientForm;
