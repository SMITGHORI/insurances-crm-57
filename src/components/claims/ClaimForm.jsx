
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { generateClaimId } from '../../utils/idGenerator';

// Define the schema for the form validation
const formSchema = z.object({
  policyId: z.string().min(1, { message: "Policy is required" }),
  memberId: z.string().optional(),
  dateOfIncident: z.date({ required_error: "Date of incident is required" }),
  dateOfFiling: z.date({ required_error: "Date of filing is required" }),
  amountClaimed: z.string().min(1, { message: "Amount claimed is required" }),
  reason: z.string().min(1, { message: "Reason for claim is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  expectedResolutionDate: z.date().optional(),

  // Health Insurance fields
  hospitalName: z.string().optional(),
  hospitalizationPeriod: z.string().optional(),
  diagnosis: z.string().optional(),
  treatingDoctor: z.string().optional(),
  preExistingCondition: z.boolean().optional(),
  cashless: z.boolean().optional(),

  // Motor Insurance fields
  accidentLocation: z.string().optional(),
  policeReportFiled: z.string().optional(),
  policeReportNumber: z.string().optional(),
  vehicleRegistrationNumber: z.string().optional(),
  vehicleModel: z.string().optional(),
  damageDetails: z.string().optional(),
  repairWorkshop: z.string().optional(),
  surveyorName: z.string().optional(),

  // Life Insurance fields
  claimNature: z.string().optional(),
  disabilityPercentage: z.string().optional(),
  dateOfDeath: z.date().optional(),
  causeOfDeath: z.string().optional()
});

const ClaimForm = ({ claim = null, onSave }) => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyMembers, setPolicyMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policyId: claim ? String(claim.policy.id) : '',
      memberId: claim && claim.member ? claim.member.memberId : '',
      dateOfIncident: claim ? new Date(claim.dateOfIncident) : new Date(),
      dateOfFiling: claim ? new Date(claim.dateOfFiling) : new Date(),
      amountClaimed: claim ? claim.amountClaimed : '',
      reason: claim ? claim.reason : '',
      status: claim ? claim.status : 'Pending',
      expectedResolutionDate: claim && claim.expectedResolutionDate ? new Date(claim.expectedResolutionDate) : undefined,
      
      // Health Insurance fields
      hospitalName: claim?.hospitalName || '',
      hospitalizationPeriod: claim?.hospitalizationPeriod || '',
      diagnosis: claim?.diagnosis || '',
      treatingDoctor: claim?.treatingDoctor || '',
      preExistingCondition: claim?.preExistingCondition || false,
      cashless: claim?.cashless || false,

      // Motor Insurance fields
      accidentLocation: claim?.accidentLocation || '',
      policeReportFiled: claim?.policeReportFiled || 'No',
      policeReportNumber: claim?.policeReportNumber || '',
      vehicleRegistrationNumber: claim?.vehicleDetails?.registrationNumber || '',
      vehicleModel: claim?.vehicleDetails?.model || '',
      damageDetails: claim?.vehicleDetails?.damageDetails || '',
      repairWorkshop: claim?.repairWorkshop || '',
      surveyorName: claim?.surveyorName || '',

      // Life Insurance fields
      claimNature: claim?.claimNature || 'Critical Illness',
      disabilityPercentage: claim?.disabilityPercentage || '',
      dateOfDeath: claim?.dateOfDeath ? new Date(claim.dateOfDeath) : undefined,
      causeOfDeath: claim?.causeOfDeath || ''
    }
  });

  // Watch for form value changes
  const policyId = form.watch('policyId');
  const insuranceType = selectedPolicy?.type || '';

  // Load data on component mount
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      // Load clients
      const storedClientsData = localStorage.getItem('clientsData');
      if (storedClientsData) {
        setClients(JSON.parse(storedClientsData));
      }
      
      // Load policies
      const storedPoliciesData = localStorage.getItem('policiesData');
      if (storedPoliciesData) {
        const policiesList = JSON.parse(storedPoliciesData);
        setPolicies(policiesList);
        
        // If editing, set the selected policy
        if (claim && claim.policy) {
          const policy = policiesList.find(p => p.id === claim.policy.id);
          setSelectedPolicy(policy);
          setPolicyMembers(policy?.members || []);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [claim]);

  // Update selected policy when policy ID changes
  useEffect(() => {
    if (policyId) {
      const policy = policies.find(p => p.id === parseInt(policyId));
      setSelectedPolicy(policy);
      setPolicyMembers(policy?.members || []);
    }
  }, [policyId, policies]);

  const onSubmit = (data) => {
    if (!selectedPolicy) {
      toast.error('Please select a policy');
      return;
    }
    
    // Get the policy client
    const policy = policies.find(p => p.id === parseInt(data.policyId));
    if (!policy) {
      toast.error('Selected policy not found');
      return;
    }
    
    // Find the client for the policy
    const client = clients.find(c => c.id === policy.client.id);
    if (!client) {
      toast.error('Client associated with policy not found');
      return;
    }
    
    // Find the member if memberId is provided
    let member = null;
    if (data.memberId && policy.members) {
      member = policy.members.find(m => m.memberId === data.memberId);
    }
    
    // Prepare type-specific details
    let typeSpecificDetails = {};
    
    if (policy.type === 'Health Insurance') {
      typeSpecificDetails = {
        hospitalName: data.hospitalName,
        hospitalizationPeriod: data.hospitalizationPeriod,
        diagnosis: data.diagnosis,
        treatingDoctor: data.treatingDoctor,
        preExistingCondition: data.preExistingCondition,
        cashless: data.cashless
      };
    } else if (policy.type === 'Motor Insurance') {
      typeSpecificDetails = {
        accidentLocation: data.accidentLocation,
        policeReportFiled: data.policeReportFiled,
        policeReportNumber: data.policeReportNumber,
        vehicleDetails: {
          registrationNumber: data.vehicleRegistrationNumber,
          model: data.vehicleModel,
          damageDetails: data.damageDetails
        },
        repairWorkshop: data.repairWorkshop,
        surveyorName: data.surveyorName
      };
    } else if (policy.type === 'Life Insurance') {
      typeSpecificDetails = {
        claimNature: data.claimNature,
        diagnosis: data.diagnosis,
        treatingDoctor: data.treatingDoctor,
        hospitalName: data.hospitalName,
        disabilityPercentage: data.disabilityPercentage,
        dateOfDeath: data.dateOfDeath ? data.dateOfDeath.toISOString() : null,
        causeOfDeath: data.causeOfDeath
      };
    }
    
    // Create or update the claim object
    const claimData = {
      id: claim ? claim.id : policies.length + 1,
      claimId: claim ? claim.claimId : generateClaimId(),
      type: policy.type,
      status: data.status,
      policy: {
        id: policy.id,
        policyNumber: policy.policyNumber,
        insurerPolicyNumber: policy.insurerPolicyNumber || '',
        insuranceCompany: policy.insuranceCompany || '',
        planName: policy.planName || ''
      },
      client: {
        id: client.id,
        name: client.name,
        contact: client.contact || client.mobile || ''
      },
      member: member,
      dateOfIncident: data.dateOfIncident.toISOString(),
      dateOfFiling: data.dateOfFiling.toISOString(),
      amountClaimed: data.amountClaimed,
      amountApproved: claim?.amountApproved || null,
      reason: data.reason,
      expectedResolutionDate: data.expectedResolutionDate ? data.expectedResolutionDate.toISOString() : null,
      documents: claim?.documents || [],
      history: claim?.history || [
        {
          action: 'Claim Filed',
          by: 'Admin',
          timestamp: new Date().toISOString(),
          details: 'Initial claim submission'
        }
      ],
      notes: claim?.notes || [],
      ...typeSpecificDetails
    };
    
    onSave(claimData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6 bg-blue-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Claim Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="policyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Policy</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={claim !== null} // Disable if editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {policies.map((policy) => (
                        <SelectItem key={policy.id} value={String(policy.id)}>
                          {policy.policyNumber} - {policy.type} - {policy.client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPolicy && selectedPolicy.type === 'Health Insurance' && policyMembers.length > 0 && (
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Member</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member for claim" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policyMembers.map((member) => (
                          <SelectItem key={member.memberId} value={member.memberId}>
                            {member.name} ({member.relation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="dateOfIncident"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Incident</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
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
              name="dateOfFiling"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Filing</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
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
              name="amountClaimed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Claimed (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedResolutionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expected Resolution Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
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
              name="reason"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Reason for Claim</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed reason for the claim"
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Conditional form fields based on insurance type */}
        {selectedPolicy && insuranceType === 'Health Insurance' && (
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Health Insurance Claim Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hospital name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hospitalizationPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospitalization Period</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 7 days" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter diagnosis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="treatingDoctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treating Doctor</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter doctor's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 col-span-2">
                <FormField
                  control={form.control}
                  name="preExistingCondition"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pre-existing Condition</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cashless"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cashless Claim (No if reimbursement)</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {selectedPolicy && insuranceType === 'Motor Insurance' && (
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Motor Insurance Claim Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accidentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accident Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policeReportFiled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Police Report Filed?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('policeReportFiled') === 'Yes' && (
                <FormField
                  control={form.control}
                  name="policeReportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Report Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter FIR number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="vehicleRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MH-01-AB-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Toyota Innova" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="damageDetails"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Damage Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the damages to the vehicle"
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="repairWorkshop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repair Workshop</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter workshop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="surveyorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surveyor Name (if assigned)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter surveyor's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {selectedPolicy && insuranceType === 'Life Insurance' && (
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Life Insurance Claim Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="claimNature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nature of Claim</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Critical Illness">Critical Illness</SelectItem>
                        <SelectItem value="Disability">Disability</SelectItem>
                        <SelectItem value="Death">Death</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('claimNature') === 'Critical Illness' && (
                <>
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter diagnosis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="treatingDoctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treating Doctor</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter doctor's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hospital name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {form.watch('claimNature') === 'Disability' && (
                <FormField
                  control={form.control}
                  name="disabilityPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disability Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('claimNature') === 'Death' && (
                <>
                  <FormField
                    control={form.control}
                    name="dateOfDeath"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Death</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
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
                              selected={field.value}
                              onSelect={field.onChange}
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
                    name="causeOfDeath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cause of Death</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cause of death" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {claim ? 'Update Claim' : 'Create Claim'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClaimForm;
