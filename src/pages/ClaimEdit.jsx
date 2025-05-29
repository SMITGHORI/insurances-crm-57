import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const ClaimEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [typeSpecificData, setTypeSpecificData] = useState({});

  useEffect(() => {
    // In a real app, this would fetch claim from API
    // Mock data for now based on ID
    const mockClaim = {
      id: parseInt(id),
      claimNumber: `AMB-CLM-2025-000${id}`,
      insuranceCompanyClaimId: id === '2' ? null : `INS-CLM-78${id}12`,
      policyId: id === '1' ? 1 : (id === '2' ? 3 : 5),
      policyNumber: id === '1' ? 'POL-2025-0125' : (id === '2' ? 'POL-2025-0156' : 'POL-2025-0189'),
      insuranceCompanyPolicyNumber: id === '1' ? 'INS-001-20250125-H' : (id === '2' ? 'STAR-H-A091238' : 'BAJA-P-112233'),
      clientId: id === '1' ? 'AMB-CLI-2025-0001' : (id === '2' ? 'AMB-CLI-2025-0012' : 'AMB-CLI-2025-0024'),
      clientName: id === '1' ? 'Vivek Patel' : (id === '2' ? 'Priya Desai' : 'Tech Solutions Ltd'),
      memberName: id === '1' ? 'Vivek Patel' : (id === '2' ? 'Rahul Desai' : 'N/A'),
      policyType: id === '1' || id === '2' ? 'Health Insurance' : 'Property Insurance',
      dateOfIncident: id === '1' ? '2025-04-12' : (id === '2' ? '2025-05-05' : '2025-03-18'),
      dateOfFiling: id === '1' ? '2025-04-14' : (id === '2' ? '2025-05-07' : '2025-03-20'),
      claimAmount: id === '1' ? 75000 : (id === '2' ? 125000 : 950000),
      approvedAmount: id === '1' ? 68500 : (id === '2' ? null : 850000),
      status: id === '1' ? 'approved' : (id === '2' ? 'pending' : 'settled'),
      claimReason: id === '1' ? 'Medical Emergency - Appendicitis' : 
                 (id === '2' ? 'Medical Treatment - Kidney Stone' : 'Property Damage - Fire'),
      
      details: id === '1' || id === '2' ? {
        // Health Insurance specific
        hospitalName: id === '1' ? 'Apollo Hospital' : 'Fortis Hospital',
        hospitalAddress: id === '1' ? '123 Health Avenue, Mumbai' : '456 Medical Park, Pune',
        hospitalContact: id === '1' ? '+91 22 2234 5678' : '+91 20 2567 8901',
        admissionDate: id === '1' ? '2025-04-12' : '2025-05-05',
        dischargeDate: id === '1' ? '2025-04-14' : '2025-05-06',
        roomCategory: id === '1' ? 'Semi-Private' : 'Private',
        diagnosis: id === '1' ? 'Acute Appendicitis' : 'Kidney Stone',
        treatment: id === '1' ? 'Laparoscopic Appendectomy' : 'Lithotripsy',
        treatmentType: id === '1' ? 'Surgical' : 'Medical',
        cashless: id === '1',
        preAuthApproved: id === '1',
        preAuthAmount: id === '1' ? 70000 : 0,
        billedAmount: id === '1' ? 75000 : 125000,
        copaymentRequired: false,
        copaymentAmount: 0,
        doctorName: id === '1' ? 'Dr. Suresh Patel' : 'Dr. Amir Khan',
        doctorSpeciality: id === '1' ? 'General Surgeon' : 'Urologist',
        medicalHistory: id === '1' ? 'No significant medical history' : 'History of kidney stones in 2023',
      } : {
        // Property Insurance specific
        propertyAddress: '123 Tech Park, Mumbai',
        propertyType: 'Commercial Office Space',
        propertySize: '10,000 sq ft',
        damageType: 'Fire Damage',
        affectedAreas: 'Server Room, 2nd Floor',
        damageExtent: 'Partial (30% of office space)',
        surveyorName: 'Rajesh Gupta',
        surveyorContact: '+91 98765 43210',
        surveyDate: '2025-03-22',
        surveyReport: 'Approved - Fire caused by electrical short circuit',
        estimatedRepairCost: 920000,
        preventionMeasuresTaken: 'Installed fire sprinklers, smoke detectors, and regular electrical maintenance',
        occupancyStatus: 'Partially occupied with temporary workspace arrangements',
      }
    };
    
    setTimeout(() => {
      setClaim(mockClaim);
      
      // Set form data
      setFormData({
        claimAmount: mockClaim.claimAmount,
        dateOfIncident: mockClaim.dateOfIncident,
        claimReason: mockClaim.claimReason,
        status: mockClaim.status,
        approvedAmount: mockClaim.approvedAmount !== null ? mockClaim.approvedAmount : '',
        isCashless: mockClaim.details.cashless || false
      });
      
      // Set type-specific data
      setTypeSpecificData(mockClaim.details);
      
      setLoading(false);
    }, 500);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeSpecificChange = (e) => {
    const { name, value } = e.target;
    setTypeSpecificData({
      ...typeSpecificData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleStatusChange = (status) => {
    setFormData({
      ...formData,
      status
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.claimAmount) {
      toast.error("Please enter claim amount");
      return;
    }

    if (!formData.dateOfIncident) {
      toast.error("Please enter date of incident");
      return;
    }

    // In a real app, this would submit to API
    toast.success("Claim updated successfully!");
    navigate(`/claims/${id}`);
  };

  const handleCancel = () => {
    navigate(`/claims/${id}`);
  };

  // Render health insurance form
  const renderHealthForm = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Medical Details</CardTitle>
          <CardDescription>Update hospital and treatment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name *</Label>
              <Input
                id="hospitalName"
                name="hospitalName"
                value={typeSpecificData.hospitalName || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter hospital name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospitalAddress">Hospital Address</Label>
              <Input
                id="hospitalAddress"
                name="hospitalAddress"
                value={typeSpecificData.hospitalAddress || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter hospital address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name *</Label>
              <Input
                id="doctorName"
                name="doctorName"
                value={typeSpecificData.doctorName || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter doctor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorSpeciality">Doctor Speciality</Label>
              <Input
                id="doctorSpeciality"
                name="doctorSpeciality"
                value={typeSpecificData.doctorSpeciality || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter doctor speciality"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                name="diagnosis"
                value={typeSpecificData.diagnosis || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter diagnosis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment *</Label>
              <Input
                id="treatment"
                name="treatment"
                value={typeSpecificData.treatment || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter treatment details"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionDate">Admission Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={typeSpecificData.admissionDate || ''}
                  onChange={handleTypeSpecificChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dischargeDate">Discharge Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="dischargeDate"
                  name="dischargeDate"
                  type="date"
                  value={typeSpecificData.dischargeDate || ''}
                  onChange={handleTypeSpecificChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomCategory">Room Category</Label>
              <Select 
                name="roomCategory" 
                value={typeSpecificData.roomCategory || ''} 
                onValueChange={(value) => setTypeSpecificData({...typeSpecificData, roomCategory: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Ward">General Ward</SelectItem>
                  <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billedAmount">Billed Amount *</Label>
              <Input
                id="billedAmount"
                name="billedAmount"
                type="number"
                value={typeSpecificData.billedAmount || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter billed amount"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox 
                id="isCashless"
                name="isCashless"
                checked={formData.isCashless || false}
                onCheckedChange={(checked) => setFormData({...formData, isCashless: checked})}
              />
              <Label htmlFor="isCashless">This is a cashless claim</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              value={typeSpecificData.medicalHistory || ''}
              onChange={handleTypeSpecificChange}
              placeholder="Enter relevant medical history"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render property insurance form
  const renderPropertyForm = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Property Damage Details</CardTitle>
          <CardDescription>Update information about the property and damage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address *</Label>
              <Input
                id="propertyAddress"
                name="propertyAddress"
                value={typeSpecificData.propertyAddress || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter property address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damageType">Damage Type *</Label>
              <Select 
                name="damageType" 
                value={typeSpecificData.damageType || ''} 
                onValueChange={(value) => setTypeSpecificData({...typeSpecificData, damageType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type of damage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fire Damage">Fire Damage</SelectItem>
                  <SelectItem value="Water Damage">Water Damage</SelectItem>
                  <SelectItem value="Storm Damage">Storm Damage</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                  <SelectItem value="Earthquake">Earthquake</SelectItem>
                  <SelectItem value="Electrical">Electrical Damage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="affectedAreas">Affected Areas *</Label>
              <Input
                id="affectedAreas"
                name="affectedAreas"
                value={typeSpecificData.affectedAreas || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Which areas are affected"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damageExtent">Damage Extent *</Label>
              <Input
                id="damageExtent"
                name="damageExtent"
                value={typeSpecificData.damageExtent || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter extent of damage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedRepairCost">Estimated Repair Cost *</Label>
              <Input
                id="estimatedRepairCost"
                name="estimatedRepairCost"
                type="number"
                value={typeSpecificData.estimatedRepairCost || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Enter estimated repair cost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupancyStatus">Occupancy Status</Label>
              <Input
                id="occupancyStatus"
                name="occupancyStatus"
                value={typeSpecificData.occupancyStatus || ''}
                onChange={handleTypeSpecificChange}
                placeholder="Current occupancy status"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
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
            {claim.claimNumber} - {claim.policyType}
          </div>
        </div>
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
                  value={claim.claimNumber}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Client</Label>
                <Input
                  value={claim.clientName}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="dateOfIncident"
                    name="dateOfIncident"
                    type="date"
                    value={formData.dateOfIncident || ''}
                    onChange={handleInputChange}
                    className="pl-10"
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || ''} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === 'approved' || formData.status === 'settled') && (
                <div className="space-y-2">
                  <Label htmlFor="approvedAmount">Approved Amount</Label>
                  <Input
                    id="approvedAmount"
                    name="approvedAmount"
                    type="number"
                    value={formData.approvedAmount || ''}
                    onChange={handleInputChange}
                    placeholder="Enter approved amount"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimReason">Claim Reason *</Label>
              <Textarea
                id="claimReason"
                name="claimReason"
                value={formData.claimReason || ''}
                onChange={handleInputChange}
                placeholder="Enter detailed reason for claim"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {claim.policyType === 'Health Insurance' && renderHealthForm()}
        {claim.policyType === 'Property Insurance' && renderPropertyForm()}
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Update Claim
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClaimEdit;
