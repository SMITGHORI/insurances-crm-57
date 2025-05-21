
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AgentForm = ({ onClose, onSuccess, existingData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: existingData.name || '',
    email: existingData.email || '',
    phone: existingData.phone || '',
    address: existingData.address || '',
    type: existingData.type || 'Full-Time',
    status: existingData.status || 'Active',
    joinDate: existingData.joinDate || new Date().toISOString().split('T')[0],
    specialization: existingData.specialization || ['Health'],
    territory: existingData.territory || '',
    manager: existingData.manager || '',
    license: {
      number: existingData.license?.number || '',
      expiryDate: existingData.license?.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
      issueDate: existingData.license?.issueDate || new Date().toISOString().split('T')[0],
      status: existingData.license?.status || 'Valid'
    },
    bankDetails: {
      accountNumber: existingData.bankDetails?.accountNumber || '',
      bankName: existingData.bankDetails?.bankName || '',
      ifscCode: existingData.bankDetails?.ifscCode || '',
      accountHolder: existingData.bankDetails?.accountHolder || ''
    },
    targets: {
      monthly: existingData.targets?.monthly || ''
    }
  });

  const [errors, setErrors] = useState({});

  // Handle specialization multi-select
  const [specialtyInput, setSpecialtyInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
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

  const handleSpecialtyAdd = () => {
    if (specialtyInput && !formData.specialization.includes(specialtyInput)) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specialtyInput]
      }));
      setSpecialtyInput('');
    }
  };

  const handleSpecialtyRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.territory) newErrors.territory = 'Territory is required';
    if (!formData.manager) newErrors.manager = 'Manager is required';
    
    // License validations
    if (!formData.license.number) newErrors['license.number'] = 'License number is required';
    if (!formData.license.issueDate) newErrors['license.issueDate'] = 'Issue date is required';
    if (!formData.license.expiryDate) newErrors['license.expiryDate'] = 'Expiry date is required';
    
    // Bank details validations
    if (!formData.bankDetails.accountNumber) newErrors['bankDetails.accountNumber'] = 'Account number is required';
    if (!formData.bankDetails.bankName) newErrors['bankDetails.bankName'] = 'Bank name is required';
    if (!formData.bankDetails.ifscCode) newErrors['bankDetails.ifscCode'] = 'IFSC code is required';
    if (!formData.bankDetails.accountHolder) newErrors['bankDetails.accountHolder'] = 'Account holder name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSuccess(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium border-b pb-2">Basic Information</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Full Name<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email<span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address<span className="text-red-500">*</span>
            </label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-amba-blue focus:ring focus:ring-amba-blue focus:ring-opacity-50"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-amba-blue focus:ring focus:ring-amba-blue focus:ring-opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Join Date
              </label>
              <Input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Monthly Target (₹)
              </label>
              <Input
                type="number"
                name="targets.monthly"
                value={formData.targets.monthly}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium border-b pb-2">Additional Details</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Territory<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="territory"
              value={formData.territory}
              onChange={handleInputChange}
              className={errors.territory ? 'border-red-500' : ''}
            />
            {errors.territory && <p className="text-red-500 text-xs">{errors.territory}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Manager<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className={errors.manager ? 'border-red-500' : ''}
            />
            {errors.manager && <p className="text-red-500 text-xs">{errors.manager}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Specialization
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.specialization.map((specialty, index) => (
                <div key={index} className="bg-amba-blue/10 text-amba-blue px-2 py-1 rounded-full text-sm flex items-center">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => handleSpecialtyRemove(index)}
                    className="ml-1 text-amba-blue hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <Input
                type="text"
                placeholder="Add specialization"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                className="rounded-r-none"
              />
              <Button 
                type="button" 
                onClick={handleSpecialtyAdd}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>
          </div>
          
          <h3 className="text-md font-medium border-b pb-2 mt-4">License Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                License Number<span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="license.number"
                value={formData.license.number}
                onChange={handleInputChange}
                className={errors['license.number'] ? 'border-red-500' : ''}
              />
              {errors['license.number'] && <p className="text-red-500 text-xs">{errors['license.number']}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                License Status
              </label>
              <select
                name="license.status"
                value={formData.license.status}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-amba-blue focus:ring focus:ring-amba-blue focus:ring-opacity-50"
              >
                <option value="Valid">Valid</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Issue Date<span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="license.issueDate"
                value={formData.license.issueDate}
                onChange={handleInputChange}
                className={errors['license.issueDate'] ? 'border-red-500' : ''}
              />
              {errors['license.issueDate'] && <p className="text-red-500 text-xs">{errors['license.issueDate']}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date<span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="license.expiryDate"
                value={formData.license.expiryDate}
                onChange={handleInputChange}
                className={errors['license.expiryDate'] ? 'border-red-500' : ''}
              />
              {errors['license.expiryDate'] && <p className="text-red-500 text-xs">{errors['license.expiryDate']}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="pt-4">
        <h3 className="text-md font-medium border-b pb-2">Bank Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Account Holder Name<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="bankDetails.accountHolder"
              value={formData.bankDetails.accountHolder}
              onChange={handleInputChange}
              className={errors['bankDetails.accountHolder'] ? 'border-red-500' : ''}
            />
            {errors['bankDetails.accountHolder'] && <p className="text-red-500 text-xs">{errors['bankDetails.accountHolder']}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Account Number<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="bankDetails.accountNumber"
              value={formData.bankDetails.accountNumber}
              onChange={handleInputChange}
              className={errors['bankDetails.accountNumber'] ? 'border-red-500' : ''}
            />
            {errors['bankDetails.accountNumber'] && <p className="text-red-500 text-xs">{errors['bankDetails.accountNumber']}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bank Name<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="bankDetails.bankName"
              value={formData.bankDetails.bankName}
              onChange={handleInputChange}
              className={errors['bankDetails.bankName'] ? 'border-red-500' : ''}
            />
            {errors['bankDetails.bankName'] && <p className="text-red-500 text-xs">{errors['bankDetails.bankName']}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              IFSC Code<span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="bankDetails.ifscCode"
              value={formData.bankDetails.ifscCode}
              onChange={handleInputChange}
              className={errors['bankDetails.ifscCode'] ? 'border-red-500' : ''}
            />
            {errors['bankDetails.ifscCode'] && <p className="text-red-500 text-xs">{errors['bankDetails.ifscCode']}</p>}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          {isEdit ? 'Update Agent' : 'Add Agent'}
        </Button>
      </div>
    </form>
  );
};

export default AgentForm;
