import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Users, Calendar, CreditCard, Percent, PlusCircle, MinusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const QuotationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [activeTab, setActiveTab] = useState('client');
  
  const [formData, setFormData] = useState({
    // Client details
    clientId: isEditMode ? 'CLI-2025-0001' : '',
    clientName: isEditMode ? 'Vivek Patel' : '',
    clientEmail: isEditMode ? 'vivek.patel@example.com' : '',
    clientPhone: isEditMode ? '+91 98765 43210' : '',
    clientAge: isEditMode ? '35' : '',
    clientGender: isEditMode ? 'male' : '',
    pincode: isEditMode ? '400001' : '',
    city: isEditMode ? 'Mumbai' : '',
    state: isEditMode ? 'Maharashtra' : '',
    occupation: isEditMode ? 'Software Engineer' : '',
    annualIncome: isEditMode ? '₹15,00,000 - ₹20,00,000' : '',
    smoking: isEditMode ? 'no' : '',
    alcoholConsumption: isEditMode ? 'occasional' : '',
    
    // Insurance details
    insuranceType: isEditMode ? 'health' : '',
    insuranceCompany: isEditMode ? 'star' : '',
    productName: isEditMode ? 'Family Floater Plan' : '',
    sumInsured: isEditMode ? '500000' : '',
    premium: isEditMode ? '25000' : '',
    paymentFrequency: isEditMode ? 'annual' : '',
    policyTerm: isEditMode ? '1' : '',
    
    // Additional options/add-ons
    addons: isEditMode ? [
      { name: 'Critical Illness Add-on', premium: '3000', isSelected: true }
    ] : [],
    
    // Family members (for health insurance)
    familyMembers: isEditMode ? [
      { relationship: 'self', age: '35', gender: 'male', preExistingConditions: '' },
      { relationship: 'spouse', age: '32', gender: 'female', preExistingConditions: '' },
      { relationship: 'son', age: '8', gender: 'male', preExistingConditions: '' },
      { relationship: 'daughter', age: '5', gender: 'female', preExistingConditions: '' }
    ] : [
      { relationship: 'self', age: '', gender: 'male', preExistingConditions: '' }
    ],
    
    // Agent details
    agentId: isEditMode ? 'agent1' : '',
    agentName: isEditMode ? 'Rajiv Kumar' : '',
    
    // Additional info
    notes: isEditMode ? 'Client requested quotes for family of 4 with no pre-existing conditions.' : ''
  });

  // Client search options - in a real app, this would come from an API
  const clientOptions = [
    { id: 'CLI-2025-0001', name: 'Vivek Patel' },
    { id: 'CLI-2025-0012', name: 'Priya Desai' },
    { id: 'CLI-2025-0024', name: 'Tech Solutions Ltd' },
    { id: 'CLI-2025-0035', name: 'Arjun Singh' }
  ];

  // Agent options - in a real app, this would come from an API
  const agentOptions = [
    { id: 'agent1', name: 'Rajiv Kumar' },
    { id: 'agent2', name: 'Priya Singh' },
    { id: 'agent3', name: 'Amir Khan' },
    { id: 'agent4', name: 'Neha Sharma' }
  ];

  // Insurance company options - in a real app, this would come from an API
  const insuranceCompanies = [
    { id: 'star', name: 'Star Health' },
    { id: 'hdfc', name: 'HDFC ERGO' },
    { id: 'icici', name: 'ICICI Lombard' },
    { id: 'max', name: 'Max Bupa' },
    { id: 'bajaj', name: 'Bajaj Allianz' }
  ];

  // Product options based on insurance type and company - in a real app, this would come from an API
  const productOptions = {
    health: {
      star: ['Family Health Optima', 'Comprehensive Health Insurance', 'Senior Citizen Health Insurance'],
      hdfc: ['My Health Suraksha', 'Health Medisure Classic', 'Health Infinity'],
      icici: ['Complete Health Insurance', 'iHealth Plus', 'Health Booster'],
      max: ['Health Companion', 'ReAssure', 'Health Premia'],
      bajaj: ['Health Guard', 'Health Infinity', 'Silver Health']
    },
    term: {
      hdfc: ['Click 2 Protect Life', 'Life Easy', 'HDFC SL ProGrowth Super II'],
      icici: ['iProtect Smart', 'iCare II', 'ICICI Pru Life Shield'],
      max: ['Online Term Plan Plus', 'Smart Secure Plus', 'Life Gain Premier']
    },
    motor: {
      bajaj: ['Comprehensive Car Insurance', 'Two-Wheeler Package Policy', 'Commercial Vehicle Insurance'],
      icici: ['ICICI Lombard Motor Insurance', 'Two Wheeler Insurance', 'Long Term Two Wheeler Insurance']
    }
  };

  // Add-on options based on insurance type and company - in a real app, this would come from an API
  const addonOptions = {
    health: {
      star: [
        { name: 'Critical Illness Add-on', premium: '3000' },
        { name: 'Room Rent Waiver', premium: '1500' },
        { name: 'Hospital Cash', premium: '800' }
      ],
      hdfc: [
        { name: 'Critical Illness Benefit', premium: '3500' },
        { name: 'Unlimited Restoration Benefit', premium: '2000' }
      ]
    },
    term: {
      hdfc: [
        { name: 'Accidental Death Benefit', premium: '1200' },
        { name: 'Critical Illness Rider', premium: '2500' }
      ]
    },
    motor: {
      bajaj: [
        { name: 'Zero Depreciation', premium: '1500' },
        { name: 'Engine Protection', premium: '800' },
        { name: 'Roadside Assistance', premium: '500' }
      ]
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clientOptions.find(c => c.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({ 
        ...prev, 
        clientId, 
        clientName: selectedClient.name,
        // In a real app, you would fetch more client details from an API
        clientEmail: 'client@example.com',
        clientPhone: '+91 98765 43210'
      }));
    }
  };

  const handleAgentSelect = (agentId) => {
    const selectedAgent = agentOptions.find(a => a.id === agentId);
    if (selectedAgent) {
      setFormData(prev => ({ 
        ...prev, 
        agentId, 
        agentName: selectedAgent.name 
      }));
    }
  };

  const handleInsuranceTypeChange = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      insuranceType: type,
      insuranceCompany: '',
      productName: '',
      addons: []
    }));
  };

  const handleInsuranceCompanyChange = (company) => {
    setFormData(prev => ({ 
      ...prev, 
      insuranceCompany: company,
      productName: '',
      addons: []
    }));
  };

  const handleAddOnToggle = (addon) => {
    setFormData(prev => {
      const existingAddonIndex = prev.addons.findIndex(a => a.name === addon.name);
      
      if (existingAddonIndex >= 0) {
        // Remove the add-on
        const updatedAddons = [...prev.addons];
        updatedAddons.splice(existingAddonIndex, 1);
        return { ...prev, addons: updatedAddons };
      } else {
        // Add the add-on
        return { ...prev, addons: [...prev.addons, { ...addon, isSelected: true }] };
      }
    });
  };

  const handleAddFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { relationship: '', age: '', gender: 'male', preExistingConditions: '' }]
    }));
  };

  const handleRemoveFamilyMember = (index) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => {
        const updatedMembers = [...prev.familyMembers];
        updatedMembers.splice(index, 1);
        return { ...prev, familyMembers: updatedMembers };
      });
    } else {
      toast.error("At least one family member is required");
    }
  };

  const handleFamilyMemberChange = (index, field, value) => {
    setFormData(prev => {
      const updatedMembers = [...prev.familyMembers];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, familyMembers: updatedMembers };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form (simplified validation for example)
    if (!formData.clientId || !formData.insuranceType || !formData.insuranceCompany) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // In a real app, you would submit this data to an API
    toast.success(isEditMode 
      ? "Quotation updated successfully!" 
      : "New quotation created successfully!");
    
    navigate('/quotations');
  };

  const handleGoBack = () => {
    navigate('/quotations');
  };

  const handleSaveAsDraft = () => {
    toast.success("Quotation saved as draft");
    navigate('/quotations');
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Quotation' : 'Create New Quotation'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="client">Client Details</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Details</TabsTrigger>
            <TabsTrigger value="members">Members & Health</TabsTrigger>
            <TabsTrigger value="agent">Agent & Notes</TabsTrigger>
          </TabsList>
          
          {/* CLIENT DETAILS TAB */}
          <TabsContent value="client" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Select an existing client or enter new client details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Select Client</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={handleClientSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientOptions.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input 
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      readOnly={formData.clientId !== ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email Address</Label>
                    <Input 
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input 
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientAge">Age</Label>
                    <Input 
                      id="clientAge"
                      type="number"
                      value={formData.clientAge}
                      onChange={(e) => handleInputChange('clientAge', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup 
                      value={formData.clientGender} 
                      onValueChange={(value) => handleInputChange('clientGender', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input 
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => handleInputChange('state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input 
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income Range</Label>
                    <Select
                      value={formData.annualIncome}
                      onValueChange={(value) => handleInputChange('annualIncome', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Below ₹5,00,000">Below ₹5,00,000</SelectItem>
                        <SelectItem value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</SelectItem>
                        <SelectItem value="₹10,00,000 - ₹15,00,000">₹10,00,000 - ₹15,00,000</SelectItem>
                        <SelectItem value="₹15,00,000 - ₹20,00,000">₹15,00,000 - ₹20,00,000</SelectItem>
                        <SelectItem value="Above ₹20,00,000">Above ₹20,00,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Do you smoke?</Label>
                    <RadioGroup 
                      value={formData.smoking} 
                      onValueChange={(value) => handleInputChange('smoking', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="smoke-yes" />
                        <Label htmlFor="smoke-yes">Yes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="smoke-no" />
                        <Label htmlFor="smoke-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Alcohol Consumption</Label>
                    <RadioGroup 
                      value={formData.alcoholConsumption} 
                      onValueChange={(value) => handleInputChange('alcoholConsumption', value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="regular" id="alcohol-regular" />
                        <Label htmlFor="alcohol-regular">Regular</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="occasional" id="alcohol-occasional" />
                        <Label htmlFor="alcohol-occasional">Occasional</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="never" id="alcohol-never" />
                        <Label htmlFor="alcohol-never">Never</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab('insurance')}
                  className="ml-auto"
                >
                  Next Step
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* INSURANCE DETAILS TAB */}
          <TabsContent value="insurance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Insurance Details</CardTitle>
                <CardDescription>Select insurance type, company, and coverage details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Type</Label>
                    <Select
                      value={formData.insuranceType}
                      onValueChange={handleInsuranceTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Health Insurance</SelectItem>
                        <SelectItem value="term">Term Insurance</SelectItem>
                        <SelectItem value="life">Life Insurance</SelectItem>
                        <SelectItem value="motor">Motor Insurance</SelectItem>
                        <SelectItem value="property">Property Insurance</SelectItem>
                        <SelectItem value="travel">Travel Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Insurance Company</Label>
                    <Select
                      value={formData.insuranceCompany}
                      onValueChange={handleInsuranceCompanyChange}
                      disabled={!formData.insuranceType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceCompanies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={formData.productName}
                      onValueChange={(value) => handleInputChange('productName', value)}
                      disabled={!formData.insuranceType || !formData.insuranceCompany}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.insuranceType && formData.insuranceCompany && 
                         productOptions[formData.insuranceType]?.[formData.insuranceCompany]?.map(product => (
                          <SelectItem key={product} value={product}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sumInsured">Sum Insured</Label>
                    <Input 
                      id="sumInsured"
                      type="number"
                      value={formData.sumInsured}
                      onChange={(e) => handleInputChange('sumInsured', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="premium">Premium</Label>
                    <Input 
                      id="premium"
                      type="number"
                      value={formData.premium}
                      onChange={(e) => handleInputChange('premium', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Frequency</Label>
                    <Select
                      value={formData.paymentFrequency}
                      onValueChange={(value) => handleInputChange('paymentFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Policy Term (Years)</Label>
                    <Select
                      value={formData.policyTerm}
                      onValueChange={(value) => handleInputChange('policyTerm', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add-ons section */}
                {formData.insuranceType && formData.insuranceCompany && 
                 addonOptions[formData.insuranceType]?.[formData.insuranceCompany] && (
                  <div className="space-y-4">
                    <Label>Available Add-ons</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addonOptions[formData.insuranceType][formData.insuranceCompany].map((addon, index) => {
                        const isSelected = formData.addons.some(a => a.name === addon.name);
                        return (
                          <div 
                            key={index} 
                            className={`border rounded-md p-3 cursor-pointer ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleAddOnToggle(addon)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{addon.name}</span>
                              <span>₹{addon.premium}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('client')}
                >
                  Previous
                </Button>
                <Button 
                  type="button"
                  onClick={() => setActiveTab('members')}
                >
                  Next Step
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* MEMBERS & HEALTH TAB */}
          <TabsContent value="members" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Members & Health Information</CardTitle>
                <CardDescription>
                  {formData.insuranceType === 'health' ? 
                    'Add family members to be covered under the policy' : 
                    'Additional health information for the insured person'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.insuranceType === 'health' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Family Members</Label>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={handleAddFamilyMember}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </div>
                    
                    {formData.familyMembers.map((member, index) => (
                      <div 
                        key={index} 
                        className="border rounded-md p-4 relative"
                      >
                        {index > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFamilyMember(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Select
                              value={member.relationship}
                              onValueChange={(value) => handleFamilyMemberChange(index, 'relationship', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                {index === 0 ? (
                                  <SelectItem value="self">Self</SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="son">Son</SelectItem>
                                    <SelectItem value="daughter">Daughter</SelectItem>
                                    <SelectItem value="father">Father</SelectItem>
                                    <SelectItem value="mother">Mother</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Age</Label>
                            <Input 
                              type="number"
                              value={member.age}
                              onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                              value={member.gender}
                              onValueChange={(value) => handleFamilyMemberChange(index, 'gender', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Pre-existing Conditions</Label>
                            <Input 
                              value={member.preExistingConditions}
                              onChange={(e) => handleFamilyMemberChange(
                                index, 
                                'preExistingConditions', 
                                e.target.value
                              )}
                              placeholder="E.g., Diabetes, Hypertension"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.insuranceType === 'term' && (
                  <div className="space-y-4">
                    <Label>Health Questionnaire</Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Have you been diagnosed with any critical illness in the last 5 years?</Label>
                        <RadioGroup className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id="critical-yes" />
                            <Label htmlFor="critical-yes">Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id="critical-no" defaultChecked />
                            <Label htmlFor="critical-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Do you have any family history of heart disease or cancer?</Label>
                        <RadioGroup className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id="family-history-yes" />
                            <Label htmlFor="family-history-yes">Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id="family-history-no" defaultChecked />
                            <Label htmlFor="family-history-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Have you been hospitalized in the last 2 years?</Label>
                        <RadioGroup className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id="hospital-yes" />
                            <Label htmlFor="hospital-yes">Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id="hospital-no" defaultChecked />
                            <Label htmlFor="hospital-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('insurance')}
                >
                  Previous
                </Button>
                <Button 
                  type="button"
                  onClick={() => setActiveTab('agent')}
                >
                  Next Step
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* AGENT & NOTES TAB */}
          <TabsContent value="agent" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details & Notes</CardTitle>
                <CardDescription>Assign an agent and add any additional notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assign Agent</Label>
                    <Select
                      value={formData.agentId}
                      onValueChange={handleAgentSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agentOptions.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Add any notes or special instructions..."
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('members')}
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={handleSaveAsDraft}
                  >
                    Save as Draft
                  </Button>
                </div>
                <Button type="submit">
                  {isEditMode ? 'Update Quotation' : 'Create Quotation'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default QuotationForm;
