
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const ClaimCreate = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [claimType, setClaimType] = useState('');
  const [formData, setFormData] = useState({
    policyId: '',
    clientId: '',
    memberName: '',
    dateOfIncident: '',
    claimAmount: '',
    claimReason: '',
    isCashless: false
  });
  const [typeSpecificData, setTypeSpecificData] = useState({});

  // Fetch policies for dropdown
  useEffect(() => {
    // In a real app, this would fetch from API
    const mockPolicies = [
      {
        id: 1,
        policyNumber: 'POL-2025-0125',
        insuranceCompanyPolicyNumber: 'INS-001-20250125-H',
        clientName: 'Vivek Patel',
        clientId: 'AMB-CLI-2025-0001',
        type: 'Health Insurance',
        status: 'active',
        members: [
          { id: 1, name: 'Vivek Patel', relation: 'Self', age: 35 },
          { id: 2, name: 'Neha Patel', relation: 'Spouse', age: 32 },
          { id: 3, name: 'Aryan Patel', relation: 'Son', age: 8 }
        ]
      },
      {
        id: 3,
        policyNumber: 'POL-2025-0156',
        insuranceCompanyPolicyNumber: 'STAR-H-A091238',
        clientName: 'Priya Desai',
        clientId: 'AMB-CLI-2025-0012',
        type: 'Health Insurance',
        status: 'active',
        members: [
          { id: 1, name: 'Priya Desai', relation: 'Self', age: 42 },
          { id: 2, name: 'Rahul Desai', relation: 'Spouse', age: 45 }
        ]
      },
      {
        id: 5,
        policyNumber: 'POL-2025-0189',
        insuranceCompanyPolicyNumber: 'BAJA-P-112233',
        clientName: 'Tech Solutions Ltd',
        clientId: 'AMB-CLI-2025-0024',
        type: 'Property Insurance',
        status: 'active'
      },
      {
        id: 7,
        policyNumber: 'POL-2025-0215',
        insuranceCompanyPolicyNumber: 'ICICI-L-332211',
        clientName: 'Arjun Singh',
        clientId: 'AMB-CLI-2025-0035',
        type: 'Term Insurance',
        status: 'active'
      }
    ];

    setTimeout(() => {
      setPolicies(mockPolicies);
      setLoading(false);
    }, 500);
  }, []);

  const handlePolicyChange = (policyId) => {
    const selectedPol = policies.find(p => p.id === parseInt(policyId));
    setSelectedPolicy(selectedPol);
    setClaimType(selectedPol?.type || '');
    setFormData({
      ...formData,
      policyId: policyId,
      clientId: selectedPol?.clientId || '',
      memberName: ''
    });
    
    // Reset type-specific data when policy changes
    initializeTypeSpecificData(selectedPol?.type || '');
  };

  const handleMemberChange = (memberId) => {
    if (!selectedPolicy?.members) return;
    
    const member = selectedPolicy.members.find(m => m.id === parseInt(memberId));
    setSelectedMember(member);
    setFormData({
      ...formData,
      memberName: member?.name || ''
    });
  };

  const initializeTypeSpecificData = (type) => {
    if (type === 'Health Insurance') {
      setTypeSpecificData({
        hospitalName: '',
        hospitalAddress: '',
        hospitalContact: '',
        admissionDate: '',
        dischargeDate: '',
        roomCategory: '',
        diagnosis: '',
        treatment: '',
        treatmentType: '',
        billedAmount: '',
        doctorName: '',
        doctorSpeciality: '',
        medicalHistory: ''
      });
    } else if (type === 'Property Insurance') {
      setTypeSpecificData({
        propertyAddress: '',
        damageType: '',
        affectedAreas: '',
        damageExtent: '',
        estimatedRepairCost: '',
        occupancyStatus: ''
      });
    } else if (type === 'Term Insurance') {
      setTypeSpecificData({
        deathDate: '',
        deathCause: '',
        nomineeDetails: '',
        nomineeContact: '',
        relationshipWithDeceased: ''
      });
    } else {
      setTypeSpecificData({});
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.policyId) {
      toast.error("Please select a policy");
      return;
    }

    if (!formData.dateOfIncident) {
      toast.error("Please enter date of incident");
      return;
    }

    if (!formData.claimAmount) {
      toast.error("Please enter claim amount");
      return;
    }

    // In a real app, this would submit to API
    // Mock success for now
    toast.success("Claim submitted successfully!");
    navigate('/claims/1'); // Navigate to a mock detail page
  };

  // Render type-specific form fields based on the policy type
  const renderTypeSpecificFields = () => {
    if (claimType === 'Health Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Medical Details</CardTitle>
            <CardDescription>Enter hospital and treatment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="hospitalContact">Hospital Contact</Label>
                <Input
                  id="hospitalContact"
                  name="hospitalContact"
                  value={typeSpecificData.hospitalContact || ''}
                  onChange={handleTypeSpecificChange}
                  placeholder="Enter hospital contact"
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
                <Label htmlFor="treatmentType">Treatment Type</Label>
                <Select 
                  name="treatmentType" 
                  value={typeSpecificData.treatmentType || ''} 
                  onValueChange={(value) => setTypeSpecificData({...typeSpecificData, treatmentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Surgical">Surgical</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                  </SelectContent>
                </Select>
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
    } else if (claimType === 'Property Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Property Damage Details</CardTitle>
            <CardDescription>Enter information about the property and damage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Select 
                  name="damageExtent" 
                  value={typeSpecificData.damageExtent || ''} 
                  onValueChange={(value) => setTypeSpecificData({...typeSpecificData, damageExtent: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select extent of damage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor (<10%)">Minor (&lt;10%)</SelectItem>
                    <SelectItem value="Moderate (10-30%)">Moderate (10-30%)</SelectItem>
                    <SelectItem value="Significant (30-60%)">Significant (30-60%)</SelectItem>
                    <SelectItem value="Major (60-90%)">Major (60-90%)</SelectItem>
                    <SelectItem value="Total (>90%)">Total (&gt;90%)</SelectItem>
                  </SelectContent>
                </Select>
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
    } else if (claimType === 'Term Insurance') {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Term Insurance Claim Details</CardTitle>
            <CardDescription>Enter information about the claim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deathDate">Date of Death *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="deathDate"
                    name="deathDate"
                    type="date"
                    value={typeSpecificData.deathDate || ''}
                    onChange={handleTypeSpecificChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathCause">Cause of Death *</Label>
                <Input
                  id="deathCause"
                  name="deathCause"
                  value={typeSpecificData.deathCause || ''}
                  onChange={handleTypeSpecificChange}
                  placeholder="Enter cause of death"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineeDetails">Nominee Details *</Label>
                <Input
                  id="nomineeDetails"
                  name="nomineeDetails"
                  value={typeSpecificData.nomineeDetails || ''}
                  onChange={handleTypeSpecificChange}
                  placeholder="Enter nominee name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineeContact">Nominee Contact *</Label>
                <Input
                  id="nomineeContact"
                  name="nomineeContact"
                  value={typeSpecificData.nomineeContact || ''}
                  onChange={handleTypeSpecificChange}
                  placeholder="Enter nominee contact"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationshipWithDeceased">Relationship with Deceased *</Label>
                <Input
                  id="relationshipWithDeceased"
                  name="relationshipWithDeceased"
                  value={typeSpecificData.relationshipWithDeceased || ''}
                  onChange={handleTypeSpecificChange}
                  placeholder="Enter relationship with deceased"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Claim</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Select the policy and provide basic claim details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyId">Select Policy *</Label>
                <Select 
                  name="policyId" 
                  value={formData.policyId || ''} 
                  onValueChange={handlePolicyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map(policy => (
                      <SelectItem key={policy.id} value={policy.id.toString()}>
                        {policy.policyNumber} - {policy.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPolicy && (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    value={selectedPolicy.clientName}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              )}
              
              {selectedPolicy?.members && selectedPolicy.members.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="memberId">Select Member *</Label>
                  <Select 
                    name="memberId" 
                    onValueChange={handleMemberChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPolicy.members.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name} ({member.relation}, {member.age} yrs)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="dateOfIncident">Date of Incident *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="dateOfIncident"
                    name="dateOfIncident"
                    type="date"
                    value={formData.dateOfIncident}
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
                  value={formData.claimAmount}
                  onChange={handleInputChange}
                  placeholder="Enter claim amount"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimReason">Claim Reason *</Label>
              <Textarea
                id="claimReason"
                name="claimReason"
                value={formData.claimReason}
                onChange={handleInputChange}
                placeholder="Enter detailed reason for claim"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {selectedPolicy && renderTypeSpecificFields()}
        
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Upload all necessary documents for claim processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG (Max 10MB per file)</p>
              <Button variant="outline" className="mt-4">Browse Files</Button>
            </div>
            
            {claimType === 'Health Insurance' && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Required Documents:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Claim Form (duly filled and signed)</li>
                  <li>Hospital Discharge Summary</li>
                  <li>All Medical Bills (original)</li>
                  <li>Investigation Reports</li>
                  <li>Doctor's Prescription</li>
                  <li>ID Proof</li>
                </ul>
              </div>
            )}
            
            {claimType === 'Property Insurance' && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Required Documents:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Claim Form (duly filled and signed)</li>
                  <li>FIR Copy (in case of theft/vandalism)</li>
                  <li>Photographs of Damaged Property</li>
                  <li>Original Purchase Receipts (if available)</li>
                  <li>Repair Estimates</li>
                  <li>Property Ownership Documents</li>
                </ul>
              </div>
            )}
            
            {claimType === 'Term Insurance' && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Required Documents:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Claim Form (duly filled and signed by nominee)</li>
                  <li>Death Certificate</li>
                  <li>Medical Records (if death due to illness)</li>
                  <li>Post Mortem Report (if applicable)</li>
                  <li>ID Proof of Nominee</li>
                  <li>Bank Account Details of Nominee</li>
                  <li>Original Policy Document</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/claims')}>
            Cancel
          </Button>
          <Button type="submit">
            Submit Claim
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClaimCreate;
