
import React, { useState } from 'react';
import { toast } from 'sonner';
import { User, Building, Users } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

const ClientForm = ({ onClose, onSuccess }) => {
  const [clientType, setClientType] = useState('individual');

  const form = useForm({
    defaultValues: {
      clientType: 'individual',
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      companyName: '',
      registrationNo: '',
      industry: '',
      employeeCount: '',
      groupName: '',
      groupType: '',
      memberCount: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  const handleSubmit = (data) => {
    console.log("Form data:", data);
    toast.success('Client added successfully');
    onSuccess && onSuccess();
    onClose && onClose();
  };

  const handleClientTypeChange = (value) => {
    setClientType(value);
    form.setValue('clientType', value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Client
        </h3>
        
        {/* Client Type Selection */}
        <div className="mb-6">
          <p className="block text-sm font-medium text-gray-700 mb-2">
            Client Type
          </p>
          <RadioGroup 
            value={clientType}
            onValueChange={handleClientTypeChange}
            className="grid grid-cols-3 gap-4"
          >
            <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${clientType === 'individual' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
              <FormControl>
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
              </FormControl>
              <User className={`h-6 w-6 mb-1 ${clientType === 'individual' ? 'text-amba-blue' : 'text-gray-500'}`} />
              <FormLabel className={`font-medium ${clientType === 'individual' ? 'text-amba-blue' : 'text-gray-700'}`}>Individual</FormLabel>
            </FormItem>
            <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${clientType === 'corporate' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
              <FormControl>
                <RadioGroupItem value="corporate" id="corporate" className="sr-only" />
              </FormControl>
              <Building className={`h-6 w-6 mb-1 ${clientType === 'corporate' ? 'text-amba-blue' : 'text-gray-500'}`} />
              <FormLabel className={`font-medium ${clientType === 'corporate' ? 'text-amba-blue' : 'text-gray-700'}`}>Corporate</FormLabel>
            </FormItem>
            <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${clientType === 'group' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
              <FormControl>
                <RadioGroupItem value="group" id="group" className="sr-only" />
              </FormControl>
              <Users className={`h-6 w-6 mb-1 ${clientType === 'group' ? 'text-amba-blue' : 'text-gray-500'}`} />
              <FormLabel className={`font-medium ${clientType === 'group' ? 'text-amba-blue' : 'text-gray-700'}`}>Group</FormLabel>
            </FormItem>
          </RadioGroup>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Dynamic fields based on client type */}
            {clientType === 'individual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} max="2007-05-20" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABCDE1234F" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234 5678 9012" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Software Engineer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="500000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {clientType === 'corporate' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC Corporation" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registrationNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="U12345MH2010PTC123456" required />
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
                          <Input {...field} placeholder="22AAAAA0000A1Z5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Hospitality">Hospitality & Tourism</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                            <SelectItem value="Transport">Transportation</SelectItem>
                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees*</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="100" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="turnover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Turnover (₹ in Lakhs)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="1000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearEstablished"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Established</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="2010" min="1900" max="2025" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {clientType === 'group' && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="groupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Family Health Group" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="groupType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select group type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="association">Association</SelectItem>
                            <SelectItem value="trust">Trust</SelectItem>
                            <SelectItem value="society">Housing Society</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="memberCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Members*</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="10" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="primaryContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Person*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rahul Sharma" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="relationshipWithGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship with Group</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Head of Family" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration ID (if applicable)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Registration ID" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Common fields for all client types */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} placeholder="example@mail.com" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 98765 43210" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="altPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 98765 43210" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main Street" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mumbai" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AN">Andaman and Nicobar Islands</SelectItem>
                            <SelectItem value="AP">Andhra Pradesh</SelectItem>
                            <SelectItem value="AR">Arunachal Pradesh</SelectItem>
                            <SelectItem value="AS">Assam</SelectItem>
                            <SelectItem value="BR">Bihar</SelectItem>
                            <SelectItem value="CH">Chandigarh</SelectItem>
                            <SelectItem value="CT">Chhattisgarh</SelectItem>
                            <SelectItem value="DL">Delhi</SelectItem>
                            <SelectItem value="GA">Goa</SelectItem>
                            <SelectItem value="GJ">Gujarat</SelectItem>
                            <SelectItem value="HR">Haryana</SelectItem>
                            <SelectItem value="HP">Himachal Pradesh</SelectItem>
                            <SelectItem value="JK">Jammu and Kashmir</SelectItem>
                            <SelectItem value="JH">Jharkhand</SelectItem>
                            <SelectItem value="KA">Karnataka</SelectItem>
                            <SelectItem value="KL">Kerala</SelectItem>
                            <SelectItem value="MP">Madhya Pradesh</SelectItem>
                            <SelectItem value="MH">Maharashtra</SelectItem>
                            <SelectItem value="MN">Manipur</SelectItem>
                            <SelectItem value="ML">Meghalaya</SelectItem>
                            <SelectItem value="MZ">Mizoram</SelectItem>
                            <SelectItem value="NL">Nagaland</SelectItem>
                            <SelectItem value="OR">Odisha</SelectItem>
                            <SelectItem value="PB">Punjab</SelectItem>
                            <SelectItem value="RJ">Rajasthan</SelectItem>
                            <SelectItem value="SK">Sikkim</SelectItem>
                            <SelectItem value="TN">Tamil Nadu</SelectItem>
                            <SelectItem value="TG">Telangana</SelectItem>
                            <SelectItem value="TR">Tripura</SelectItem>
                            <SelectItem value="UP">Uttar Pradesh</SelectItem>
                            <SelectItem value="UK">Uttarakhand</SelectItem>
                            <SelectItem value="WB">West Bengal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="400001" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional information */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Source</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How did you find this client?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="campaign">Marketing Campaign</SelectItem>
                          <SelectItem value="lead">Lead Generation</SelectItem>
                          <SelectItem value="direct">Direct Contact</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Any additional information" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedAgentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Agent</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Amit Kumar</SelectItem>
                          <SelectItem value="2">Priya Sharma</SelectItem>
                          <SelectItem value="3">Raj Patel</SelectItem>
                          <SelectItem value="4">Neha Gupta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amba-blue hover:bg-amba-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
              >
                Add Client
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClientForm;
