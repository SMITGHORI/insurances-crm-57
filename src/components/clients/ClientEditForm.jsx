
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Save } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ClientEditForm = ({ client, onSave }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-info");
  
  const form = useForm({
    defaultValues: {
      // Basic client info
      name: client?.name || '',
      clientType: client?.type?.toLowerCase() || 'individual',
      email: client?.email || '',
      phone: client?.contact || '',
      address: client?.location?.split(',')[0]?.trim() || '',
      city: client?.location?.split(',')[1]?.trim() || '',
      state: client?.location?.split(',')[2]?.trim() || '',
      status: client?.status || 'Active',
      
      // Type specific fields with defaults
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      panNumber: '',
      aadharNumber: '',
      occupation: '',
      
      companyName: '',
      registrationNo: '',
      gstNumber: '',
      industry: '',
      employeeCount: '',
      turnover: '',
      
      groupName: '',
      groupType: '',
      memberCount: '',
      primaryContactName: '',
      
      // Additional fields
      notes: '',
      assignedAgentId: '',
    }
  });

  // Pre-fill form with client data if editing
  useEffect(() => {
    if (client) {
      const defaults = {
        name: client.name || '',
        clientType: client.type?.toLowerCase() || 'individual',
        email: client.email || '',
        phone: client.contact || '',
        status: client.status || 'Active'
      };
      
      // Split location into address components if available
      if (client.location) {
        const locationParts = client.location.split(',');
        if (locationParts.length >= 1) defaults.address = locationParts[0].trim();
        if (locationParts.length >= 2) defaults.city = locationParts[1].trim();
        if (locationParts.length >= 3) defaults.state = locationParts[2].trim();
      }
      
      // Set client type specific fields
      if (client.type === 'Individual' && client.name) {
        const nameParts = client.name.split(' ');
        if (nameParts.length >= 1) defaults.firstName = nameParts[0];
        if (nameParts.length >= 2) defaults.lastName = nameParts.slice(1).join(' ');
      } else if (client.type === 'Corporate') {
        defaults.companyName = client.name;
      } else if (client.type === 'Group') {
        defaults.groupName = client.name;
      }
      
      // Update form with all default values
      Object.entries(defaults).forEach(([key, value]) => {
        form.setValue(key, value);
      });
    }
  }, [client, form]);

  // Handle form submission
  const handleSubmit = (data) => {
    // Prepare updated client data
    const clientType = data.clientType;
    
    // Determine name based on client type
    let name = data.name;
    if (clientType === 'individual' && data.firstName) {
      name = `${data.firstName} ${data.lastName || ''}`.trim();
    } else if (clientType === 'corporate' && data.companyName) {
      name = data.companyName;
    } else if (clientType === 'group' && data.groupName) {
      name = data.groupName;
    }
    
    // Format location
    const location = `${data.address || ''}, ${data.city || ''}, ${data.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
    
    // Create updated client object
    const updatedClient = {
      ...client,
      name,
      type: clientType === 'individual' 
        ? 'Individual' 
        : clientType === 'corporate' 
          ? 'Corporate' 
          : 'Group',
      email: data.email,
      contact: data.phone,
      location,
      status: data.status,
      // Add any additional fields needed
    };
    
    // Save client
    onSave && onSave(updatedClient);
    toast.success(`Client ${name} updated successfully`);
    navigate('/clients');
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/clients')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </Button>
        <h1 className="text-xl font-semibold">
          Edit Client: {client?.name}
          {client?.clientId && <span className="text-sm font-normal text-gray-500 ml-2">{client.clientId}</span>}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                <TabsTrigger value="contact-details">Contact Details</TabsTrigger>
                <TabsTrigger value="additional-info">Additional Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic-info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Client Type*</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${field.value === 'individual' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
                            <FormControl>
                              <RadioGroupItem value="individual" id="individual" className="sr-only" />
                            </FormControl>
                            <FormLabel className={`font-medium ${field.value === 'individual' ? 'text-amba-blue' : 'text-gray-700'}`}>Individual</FormLabel>
                          </FormItem>
                          <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${field.value === 'corporate' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
                            <FormControl>
                              <RadioGroupItem value="corporate" id="corporate" className="sr-only" />
                            </FormControl>
                            <FormLabel className={`font-medium ${field.value === 'corporate' ? 'text-amba-blue' : 'text-gray-700'}`}>Corporate</FormLabel>
                          </FormItem>
                          <FormItem className={`flex flex-col items-center justify-center rounded-md p-2 cursor-pointer border-2 ${field.value === 'group' ? 'border-amba-blue bg-amba-blue/5' : 'border-gray-200'}`}>
                            <FormControl>
                              <RadioGroupItem value="group" id="group" className="sr-only" />
                            </FormControl>
                            <FormLabel className={`font-medium ${field.value === 'group' ? 'text-amba-blue' : 'text-gray-700'}`}>Group</FormLabel>
                          </FormItem>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('clientType') === 'individual' && (
                    <>
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Aarav" required />
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
                              <Input {...field} placeholder="Sharma" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} max="2007-05-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="panNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ABCDE1234F" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {form.watch('clientType') === 'corporate' && (
                    <>
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Company Name*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Tata Consultancy Services Ltd." required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="registrationNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="U12345MH2010PTC123456" />
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
                    </>
                  )}
                  
                  {form.watch('clientType') === 'group' && (
                    <>
                      <FormField
                        control={form.control}
                        name="groupName"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Group Name*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Sharma Family Group" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="groupType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Type</FormLabel>
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
                            <FormLabel>Number of Members</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} placeholder="10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("contact-details")}
                  >
                    Next: Contact Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="contact-details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} placeholder="name@example.com" required />
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
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 MG Road" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mumbai" />
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
                        <FormLabel>State</FormLabel>
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
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Telangana">Telangana</SelectItem>
                            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                            <SelectItem value="Punjab">Punjab</SelectItem>
                            <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("basic-info")}
                  >
                    Back: Basic Information
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("additional-info")}
                  >
                    Next: Additional Information
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="additional-info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
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
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("contact-details")}
                  >
                    Back: Contact Details
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amba-blue hover:bg-amba-blue/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClientEditForm;
