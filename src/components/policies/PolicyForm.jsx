
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const policySchema = z.object({
  status: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gracePeriod: z.coerce.number().min(0),
  paymentFrequency: z.string(),
  sumAssured: z.string(),
  premium: z.string(),
  type: z.string(),
  insuranceCompany: z.string(),
  planName: z.string(),
  lockInPeriod: z.coerce.number().min(0),
  discountPercentage: z.coerce.number().min(0).max(100),
  gstNumber: z.string().optional(),
  nextYearPremium: z.string().optional(),
  insuranceCompanyPolicyNumber: z.string().optional(),
  client: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

const PolicyForm = ({ policy, onSave, clients, isNew = false }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();
  const [typeSpecificFields, setTypeSpecificFields] = useState({});
  
  const form = useForm({
    resolver: zodResolver(policySchema),
    defaultValues: {
      status: policy.status || '',
      startDate: policy.startDate || '',
      endDate: policy.endDate || '',
      gracePeriod: policy.gracePeriod || 30,
      paymentFrequency: policy.paymentFrequency || '',
      sumAssured: policy.sumAssured || '',
      premium: policy.premium || '',
      type: policy.type || '',
      insuranceCompany: policy.insuranceCompany || '',
      planName: policy.planName || '',
      lockInPeriod: policy.lockInPeriod || 0,
      discountPercentage: policy.discountPercentage || 0,
      gstNumber: policy.gstNumber || '',
      nextYearPremium: policy.nextYearPremium || '',
      insuranceCompanyPolicyNumber: policy.insuranceCompanyPolicyNumber || '',
      client: policy.client || { id: '', name: '' },
    },
  });
  
  useEffect(() => {
    // Initialize type-specific fields if they exist
    if (policy.typeSpecificDetails) {
      setTypeSpecificFields(policy.typeSpecificDetails);
    }
  }, [policy]);
  
  useEffect(() => {
    // Set selected client based on the policy
    if (policy.client && policy.client.id) {
      const client = clients.find(c => c.id === parseInt(policy.client.id));
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [policy, clients]);

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(client => client.id === parseInt(clientId));
    if (selectedClient) {
      setSelectedClient(selectedClient);
      form.setValue('client', { id: clientId, name: selectedClient.name });
    }
  };

  const handlePolicyTypeChange = (type) => {
    form.setValue('type', type);
    
    // Reset type-specific fields when type changes
    setTypeSpecificFields({});
  };

  const updateTypeSpecificField = (field, value) => {
    setTypeSpecificFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const onSubmit = (data) => {
    if (!data.client.id || !data.client.name) {
      toast.error('Please select a client');
      return;
    }
    
    // Add type-specific details to the policy
    const completePolicy = {
      ...policy,
      ...data,
      typeSpecificDetails: typeSpecificFields
    };
    
    onSave(completePolicy);
  };

  // Render type-specific fields based on policy type
  const renderTypeSpecificFields = () => {
    const policyType = form.watch('type');
    
    if (policyType === 'Health Insurance') {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Health Insurance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Coverage Type</FormLabel>
                <Select
                  value={typeSpecificFields.coverageType || 'Individual'}
                  onValueChange={(value) => updateTypeSpecificField('coverageType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Family Floater">Family Floater</SelectItem>
                    <SelectItem value="Critical Illness">Critical Illness</SelectItem>
                    <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel>Waiting Period (days)</FormLabel>
                <Input
                  type="number"
                  value={typeSpecificFields.waitingPeriod || ''}
                  onChange={(e) => updateTypeSpecificField('waitingPeriod', e.target.value)}
                />
              </div>
              
              <div>
                <FormLabel>Room Rent Limit</FormLabel>
                <Input
                  value={typeSpecificFields.roomRentLimit || ''}
                  onChange={(e) => updateTypeSpecificField('roomRentLimit', e.target.value)}
                  placeholder="e.g., 2% of sum insured"
                />
              </div>
              
              <div>
                <FormLabel>Coverage Amount</FormLabel>
                <Input
                  value={typeSpecificFields.coverageAmount || ''}
                  onChange={(e) => updateTypeSpecificField('coverageAmount', e.target.value)}
                  placeholder="e.g., ₹500,000"
                />
              </div>
              
              <div className="col-span-2">
                <FormLabel>Pre-existing Diseases Covered</FormLabel>
                <Input
                  value={typeSpecificFields.preExistingDiseases || ''}
                  onChange={(e) => updateTypeSpecificField('preExistingDiseases', e.target.value)}
                  placeholder="List pre-existing conditions covered"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (policyType === 'Life Insurance') {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Life Insurance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Maturity Age</FormLabel>
                <Input
                  type="number"
                  value={typeSpecificFields.maturityAge || ''}
                  onChange={(e) => updateTypeSpecificField('maturityAge', e.target.value)}
                  placeholder="e.g., 65"
                />
              </div>
              
              <div>
                <FormLabel>Death Benefit</FormLabel>
                <Input
                  value={typeSpecificFields.deathBenefit || ''}
                  onChange={(e) => updateTypeSpecificField('deathBenefit', e.target.value)}
                  placeholder="e.g., Sum Assured + Bonus"
                />
              </div>
              
              <div>
                <FormLabel>Critical Illness Cover</FormLabel>
                <Input
                  value={typeSpecificFields.criticalIllnessCover || ''}
                  onChange={(e) => updateTypeSpecificField('criticalIllnessCover', e.target.value)}
                  placeholder="e.g., ₹500,000"
                />
              </div>
              
              <div>
                <FormLabel>Accidental Death Benefit</FormLabel>
                <Input
                  value={typeSpecificFields.accidentalDeathBenefit || ''}
                  onChange={(e) => updateTypeSpecificField('accidentalDeathBenefit', e.target.value)}
                  placeholder="e.g., 2x Sum Assured"
                />
              </div>
              
              <div className="col-span-2">
                <FormLabel>Riders Included</FormLabel>
                <Input
                  value={typeSpecificFields.ridersIncluded || ''}
                  onChange={(e) => updateTypeSpecificField('ridersIncluded', e.target.value)}
                  placeholder="e.g., Premium Waiver, Income Benefit"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (policyType === 'Motor Insurance') {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Insurance Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Vehicle Type</FormLabel>
                <Select
                  value={typeSpecificFields.vehicleType || ''}
                  onValueChange={(value) => updateTypeSpecificField('vehicleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Two Wheeler">Two Wheeler</SelectItem>
                    <SelectItem value="Commercial Vehicle">Commercial Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel>Vehicle Model</FormLabel>
                <Input
                  value={typeSpecificFields.vehicleModel || ''}
                  onChange={(e) => updateTypeSpecificField('vehicleModel', e.target.value)}
                  placeholder="e.g., Honda City"
                />
              </div>
              
              <div>
                <FormLabel>Registration Number</FormLabel>
                <Input
                  value={typeSpecificFields.vehicleNumber || ''}
                  onChange={(e) => updateTypeSpecificField('vehicleNumber', e.target.value)}
                  placeholder="e.g., MH-01-AB-1234"
                />
              </div>
              
              <div>
                <FormLabel>IDV (Insured Declared Value)</FormLabel>
                <Input
                  value={typeSpecificFields.idv || ''}
                  onChange={(e) => updateTypeSpecificField('idv', e.target.value)}
                  placeholder="e.g., ₹500,000"
                />
              </div>
              
              <div>
                <FormLabel>Engine Number</FormLabel>
                <Input
                  value={typeSpecificFields.engineNumber || ''}
                  onChange={(e) => updateTypeSpecificField('engineNumber', e.target.value)}
                  placeholder="Enter engine number"
                />
              </div>
              
              <div>
                <FormLabel>Chassis Number</FormLabel>
                <Input
                  value={typeSpecificFields.chassisNumber || ''}
                  onChange={(e) => updateTypeSpecificField('chassisNumber', e.target.value)}
                  placeholder="Enter chassis number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Selection */}
              <div className="md:col-span-3">
                <FormLabel className="text-lg font-semibold mb-4">Client Information</FormLabel>
                <Select
                  value={selectedClient ? selectedClient.id.toString() : ''}
                  onValueChange={handleClientChange}
                  disabled={!isNew && policy.client?.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.contactInfo?.phone || 'No phone'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <Select
                      onValueChange={(value) => handlePolicyTypeChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                        <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                        <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                        <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                        <SelectItem value="Fire Insurance">Fire Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="In Force">In Force</SelectItem>
                        <SelectItem value="Grace">Grace Period</SelectItem>
                        <SelectItem value="Lapsed">Lapsed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Surrendered">Surrendered</SelectItem>
                        <SelectItem value="Matured">Matured</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Company</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="planName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceCompanyPolicyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Company Policy Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter insurance company's policy number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Type specific fields */}
        {renderTypeSpecificFields()}
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gracePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grace Period (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sumAssured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sum Assured</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="premium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premium</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="One Time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lockInPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lock-in Period (years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nextYearPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Year Premium</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {isNew ? 'Create Policy' : 'Update Policy'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PolicyForm;
