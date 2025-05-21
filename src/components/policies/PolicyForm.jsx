import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Building, FileText, Lock, Percent, Calendar, FileText as GSTIcon, Shield, Car } from 'lucide-react';

const PolicyForm = ({ policy, onSave, clients: providedClients, isNew = false }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(providedClients || []);
  const [loading, setLoading] = useState(!providedClients);
  const [policyType, setPolicyType] = useState(policy?.type || '');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      ...policy,
      clientId: policy?.client?.id || '',
      insuranceCompany: policy?.insuranceCompany || '',
      planName: policy?.planName || '',
      lockInPeriod: policy?.lockInPeriod || 0,
      discountPercentage: policy?.discountPercentage || 0,
      gstNumber: policy?.gstNumber || '',
      nextYearPremium: policy?.nextYearPremium || '',
      // Type-specific fields with defaults
      // Health Insurance
      coverageType: policy?.typeSpecificDetails?.coverageType || 'Individual',
      waitingPeriod: policy?.typeSpecificDetails?.waitingPeriod || 30,
      preExistingDiseases: policy?.typeSpecificDetails?.preExistingDiseases || '',
      roomRentLimit: policy?.typeSpecificDetails?.roomRentLimit || '',
      coverageAmount: policy?.typeSpecificDetails?.coverageAmount || '',
      // Term Insurance
      maturityAge: policy?.typeSpecificDetails?.maturityAge || 60,
      deathBenefit: policy?.typeSpecificDetails?.deathBenefit || '',
      ridersIncluded: policy?.typeSpecificDetails?.ridersIncluded || '',
      criticalIllnessCover: policy?.typeSpecificDetails?.criticalIllnessCover || '',
      accidentalDeathBenefit: policy?.typeSpecificDetails?.accidentalDeathBenefit || '',
      // Vehicle Insurance
      vehicleType: policy?.typeSpecificDetails?.vehicleType || 'Car',
      vehicleModel: policy?.typeSpecificDetails?.vehicleModel || '',
      vehicleNumber: policy?.typeSpecificDetails?.vehicleNumber || '',
      engineNumber: policy?.typeSpecificDetails?.engineNumber || '',
      chassisNumber: policy?.typeSpecificDetails?.chassisNumber || '',
      idv: policy?.typeSpecificDetails?.idv || '',
    }
  });

  const selectedClientId = watch('clientId');
  const currentPolicyType = watch('type');

  // Update state when policy type changes
  useEffect(() => {
    if (currentPolicyType !== policyType) {
      setPolicyType(currentPolicyType);
    }
  }, [currentPolicyType, policyType]);

  useEffect(() => {
    // If clients are not provided, fetch them
    if (!providedClients) {
      setLoading(true);
      const storedClientsData = localStorage.getItem('clientsData');
      if (storedClientsData) {
        setClients(JSON.parse(storedClientsData));
      }
      setLoading(false);
    }
  }, [providedClients]);

  const onSubmit = (data) => {
    // Find the selected client
    const selectedClient = clients.find(c => c.id === parseInt(data.clientId));
    
    if (!selectedClient) {
      toast.error('Please select a valid client');
      return;
    }
    
    // Extract type-specific details based on policy type
    const typeSpecificDetails = {};
    
    if (data.type === 'Health Insurance') {
      typeSpecificDetails.coverageType = data.coverageType;
      typeSpecificDetails.waitingPeriod = parseInt(data.waitingPeriod) || 0;
      typeSpecificDetails.preExistingDiseases = data.preExistingDiseases;
      typeSpecificDetails.roomRentLimit = data.roomRentLimit;
      typeSpecificDetails.coverageAmount = data.coverageAmount;
    } else if (data.type === 'Life Insurance') {
      typeSpecificDetails.maturityAge = parseInt(data.maturityAge) || 0;
      typeSpecificDetails.deathBenefit = data.deathBenefit;
      typeSpecificDetails.ridersIncluded = data.ridersIncluded;
      typeSpecificDetails.criticalIllnessCover = data.criticalIllnessCover;
      typeSpecificDetails.accidentalDeathBenefit = data.accidentalDeathBenefit;
    } else if (data.type === 'Motor Insurance') {
      typeSpecificDetails.vehicleType = data.vehicleType;
      typeSpecificDetails.vehicleModel = data.vehicleModel;
      typeSpecificDetails.vehicleNumber = data.vehicleNumber;
      typeSpecificDetails.engineNumber = data.engineNumber;
      typeSpecificDetails.chassisNumber = data.chassisNumber;
      typeSpecificDetails.idv = data.idv;
    }
    
    // Format the data
    const formattedData = {
      ...policy,
      ...data,
      sumAssured: data.sumAssured.toString(),
      premium: data.premium.toString(),
      client: {
        id: selectedClient.id,
        name: selectedClient.name
      },
      insuranceCompany: data.insuranceCompany,
      planName: data.planName,
      lockInPeriod: parseInt(data.lockInPeriod),
      discountPercentage: parseFloat(data.discountPercentage),
      gstNumber: data.gstNumber,
      nextYearPremium: data.nextYearPremium.toString(),
      typeSpecificDetails: typeSpecificDetails,
    };
    
    // Remove clientId and fields that are now in typeSpecificDetails
    delete formattedData.clientId;
    delete formattedData.coverageType;
    delete formattedData.waitingPeriod;
    delete formattedData.preExistingDiseases;
    delete formattedData.roomRentLimit;
    delete formattedData.coverageAmount;
    delete formattedData.maturityAge;
    delete formattedData.deathBenefit;
    delete formattedData.ridersIncluded;
    delete formattedData.criticalIllnessCover;
    delete formattedData.accidentalDeathBenefit;
    delete formattedData.vehicleType;
    delete formattedData.vehicleModel;
    delete formattedData.vehicleNumber;
    delete formattedData.engineNumber;
    delete formattedData.chassisNumber;
    delete formattedData.idv;
    
    onSave(formattedData);
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/policies');
    } else {
      navigate(`/policies/${policy.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amba-blue"></div>
      </div>
    );
  }

  // Render specific fields based on policy type
  const renderTypeSpecificFields = () => {
    if (policyType === 'Health Insurance') {
      return (
        <div className="border p-4 rounded-md mb-6 bg-blue-50">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" /> Health Insurance Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="coverageType">Coverage Type</Label>
              <Select 
                onValueChange={(value) => setValue('coverageType', value)} 
                defaultValue={watch('coverageType')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Coverage Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Family Floater">Family Floater</SelectItem>
                  <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                  <SelectItem value="Critical Illness">Critical Illness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waitingPeriod">Waiting Period (days)</Label>
              <Input 
                type="number"
                id="waitingPeriod"
                min="0"
                {...register('waitingPeriod')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preExistingDiseases">Pre-existing Diseases</Label>
              <Textarea 
                id="preExistingDiseases"
                placeholder="List any pre-existing conditions covered"
                {...register('preExistingDiseases')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomRentLimit">Room Rent Limit</Label>
              <Input 
                type="text"
                id="roomRentLimit"
                placeholder="e.g. ₹3,000 per day or Single Private Room"
                {...register('roomRentLimit')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageAmount">Coverage Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input 
                  type="text"
                  id="coverageAmount"
                  className="pl-8"
                  placeholder="e.g. 5 Lakhs per year"
                  {...register('coverageAmount')}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (policyType === 'Life Insurance') {
      return (
        <div className="border p-4 rounded-md mb-6 bg-green-50">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" /> Term Insurance Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maturityAge">Maturity Age</Label>
              <Input 
                type="number"
                id="maturityAge"
                min="0"
                max="100"
                {...register('maturityAge')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deathBenefit">Death Benefit</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input 
                  type="text"
                  id="deathBenefit"
                  className="pl-8"
                  placeholder="Death benefit amount"
                  {...register('deathBenefit')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ridersIncluded">Riders Included</Label>
              <Textarea 
                id="ridersIncluded"
                placeholder="Additional benefits/riders included in the policy"
                {...register('ridersIncluded')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticalIllnessCover">Critical Illness Cover</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input 
                  type="text"
                  id="criticalIllnessCover"
                  className="pl-8"
                  placeholder="Amount covered for critical illness"
                  {...register('criticalIllnessCover')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accidentalDeathBenefit">Accidental Death Benefit</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input 
                  type="text"
                  id="accidentalDeathBenefit"
                  className="pl-8"
                  placeholder="Additional benefit on accidental death"
                  {...register('accidentalDeathBenefit')}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (policyType === 'Motor Insurance') {
      return (
        <div className="border p-4 rounded-md mb-6 bg-amber-50">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Car className="h-5 w-5 text-amber-600" /> Vehicle Insurance Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select 
                onValueChange={(value) => setValue('vehicleType', value)} 
                defaultValue={watch('vehicleType')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Two-Wheeler">Two-Wheeler</SelectItem>
                  <SelectItem value="Commercial Vehicle">Commercial Vehicle</SelectItem>
                  <SelectItem value="Heavy Vehicle">Heavy Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Vehicle Model</Label>
              <Input 
                type="text"
                id="vehicleModel"
                placeholder="Make and model of the vehicle"
                {...register('vehicleModel')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Registration Number</Label>
              <Input 
                type="text"
                id="vehicleNumber"
                placeholder="Vehicle registration number"
                {...register('vehicleNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineNumber">Engine Number</Label>
              <Input 
                type="text"
                id="engineNumber"
                placeholder="Engine number"
                {...register('engineNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chassisNumber">Chassis Number</Label>
              <Input 
                type="text"
                id="chassisNumber"
                placeholder="Chassis number"
                {...register('chassisNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idv">Insured Declared Value (IDV)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">₹</span>
                <Input 
                  type="text"
                  id="idv"
                  className="pl-8"
                  placeholder="Current market value of vehicle"
                  {...register('idv')}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => setValue('clientId', value)} 
              defaultValue={selectedClientId.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name} ({client.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-red-500 text-sm">Client is required</p>
            )}
          </div>

          {/* Insurance Company */}
          <div className="space-y-2">
            <Label htmlFor="insuranceCompany" className="flex items-center gap-1">
              <Building className="h-4 w-4" /> Insurance Company <span className="text-red-500">*</span>
            </Label>
            <Select 
              onValueChange={(value) => setValue('insuranceCompany', value)} 
              defaultValue={policy.insuranceCompany}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Insurance Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIC">LIC</SelectItem>
                <SelectItem value="HDFC Life">HDFC Life</SelectItem>
                <SelectItem value="ICICI Prudential">ICICI Prudential</SelectItem>
                <SelectItem value="SBI Life">SBI Life</SelectItem>
                <SelectItem value="Max Life">Max Life</SelectItem>
                <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                <SelectItem value="Aditya Birla">Aditya Birla</SelectItem>
                <SelectItem value="Kotak Life">Kotak Life</SelectItem>
                <SelectItem value="Reliance Nippon">Reliance Nippon</SelectItem>
                <SelectItem value="Tata AIA">Tata AIA</SelectItem>
                <SelectItem value="Star Health">Star Health</SelectItem>
                <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                <SelectItem value="New India Assurance">New India Assurance</SelectItem>
                <SelectItem value="United India Insurance">United India Insurance</SelectItem>
                <SelectItem value="Oriental Insurance">Oriental Insurance</SelectItem>
              </SelectContent>
            </Select>
            {errors.insuranceCompany && (
              <p className="text-red-500 text-sm">Insurance company is required</p>
            )}
          </div>

          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="planName" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> Plan Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              type="text"
              id="planName"
              {...register('planName', { required: true })}
            />
            {errors.planName && (
              <p className="text-red-500 text-sm">Plan name is required</p>
            )}
          </div>

          {/* Policy Type - Updated to add insurance type icons */}
          <div className="space-y-2">
            <Label htmlFor="type">Policy Type <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => setValue('type', value)} 
              defaultValue={policy.type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Policy Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health Insurance">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    Health Insurance
                  </div>
                </SelectItem>
                <SelectItem value="Life Insurance">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Life Insurance
                  </div>
                </SelectItem>
                <SelectItem value="Motor Insurance">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2 text-amber-600" />
                    Motor Insurance
                  </div>
                </SelectItem>
                <SelectItem value="Property Insurance">Property Insurance</SelectItem>
                <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                <SelectItem value="Commercial Insurance">Commercial Insurance</SelectItem>
                <SelectItem value="Marine Insurance">Marine Insurance</SelectItem>
                <SelectItem value="Liability Insurance">Liability Insurance</SelectItem>
                <SelectItem value="Cyber Insurance">Cyber Insurance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">Policy type is required</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => setValue('status', value)} 
              defaultValue={policy.status}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="In Force">In Force</SelectItem>
                <SelectItem value="Grace">Grace</SelectItem>
                <SelectItem value="Lapsed">Lapsed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Surrendered">Surrendered</SelectItem>
                <SelectItem value="Matured">Matured</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">Status is required</p>
            )}
          </div>

          {/* Sum Assured */}
          <div className="space-y-2">
            <Label htmlFor="sumAssured">Sum Assured <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">₹</span>
              <Input 
                type="number"
                id="sumAssured"
                className="pl-8"
                {...register('sumAssured', { required: true })}
              />
            </div>
            {errors.sumAssured && (
              <p className="text-red-500 text-sm">Sum assured is required</p>
            )}
          </div>

          {/* Premium */}
          <div className="space-y-2">
            <Label htmlFor="premium">Premium <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">₹</span>
              <Input 
                type="number"
                id="premium"
                className="pl-8"
                {...register('premium', { required: true })}
              />
            </div>
            {errors.premium && (
              <p className="text-red-500 text-sm">Premium is required</p>
            )}
          </div>

          {/* Next Year Premium */}
          <div className="space-y-2">
            <Label htmlFor="nextYearPremium" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Next Year Premium
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">₹</span>
              <Input 
                type="number"
                id="nextYearPremium"
                className="pl-8"
                {...register('nextYearPremium')}
              />
            </div>
          </div>

          {/* Payment Frequency */}
          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">Payment Frequency <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => setValue('paymentFrequency', value)} 
              defaultValue={policy.paymentFrequency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Single Premium">Single Premium</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentFrequency && (
              <p className="text-red-500 text-sm">Payment frequency is required</p>
            )}
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label htmlFor="gstNumber" className="flex items-center gap-1">
              <GSTIcon className="h-4 w-4" /> GST Number
            </Label>
            <Input 
              type="text"
              id="gstNumber"
              placeholder="For GST claims (optional)"
              {...register('gstNumber')}
            />
          </div>

          {/* Lock-in Period */}
          <div className="space-y-2">
            <Label htmlFor="lockInPeriod" className="flex items-center gap-1">
              <Lock className="h-4 w-4" /> Lock-in Period (years)
            </Label>
            <Input 
              type="number"
              id="lockInPeriod"
              min="0"
              {...register('lockInPeriod')}
            />
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discountPercentage" className="flex items-center gap-1">
              <Percent className="h-4 w-4" /> Discount (%)
            </Label>
            <Input 
              type="number"
              id="discountPercentage"
              min="0"
              max="100"
              step="0.01"
              {...register('discountPercentage')}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
            <Input 
              type="date"
              id="startDate"
              {...register('startDate', { required: true })}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm">Start date is required</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
            <Input 
              type="date"
              id="endDate"
              {...register('endDate', { required: true })}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">End date is required</p>
            )}
          </div>

          {/* Grace Period */}
          <div className="space-y-2">
            <Label htmlFor="gracePeriod">Grace Period (days) <span className="text-red-500">*</span></Label>
            <Input 
              type="number"
              id="gracePeriod"
              {...register('gracePeriod', { required: true })}
            />
            {errors.gracePeriod && (
              <p className="text-red-500 text-sm">Grace period is required</p>
            )}
          </div>
          
          {/* Commission (optional) */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="commissionPercentage">Commission Percentage</Label>
            <div className="relative">
              <Input 
                type="number"
                id="commissionPercentage"
                className="pr-8"
                {...register('commission.percentage')}
              />
              <span className="absolute right-3 top-2.5">%</span>
            </div>
          </div>
        </div>

        {/* Type-specific fields section */}
        {policyType && renderTypeSpecificFields()}

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isNew ? 'Create Policy' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PolicyForm;
