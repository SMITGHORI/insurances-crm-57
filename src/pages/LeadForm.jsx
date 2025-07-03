import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLead, useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const leadFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().optional(),
  source: z.string().min(1, { message: "Source is required." }),
  product: z.string().min(1, { message: "Product is required." }),
  status: z.string().min(1, { message: "Status is required." }),
  budget: z.string().optional(),
  assignedTo: z.string().min(1, { message: "Assigned agent is required." }),
  priority: z.string().min(1, { message: "Priority is required." }),
  additionalInfo: z.string().optional(),
});

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [isEditMode, setIsEditMode] = useState(!!id);

  // Connect to MongoDB for lead data
  const { data: lead, isLoading, error } = useLead(id);
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      source: 'Website',
      product: 'Health Insurance',
      status: 'New',
      budget: '',
      assignedTo: 'Raj Malhotra',
      priority: 'Medium',
      additionalInfo: '',
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (id && lead) {
      setIsEditMode(true);
      form.reset({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        address: lead.address || '',
        source: lead.source || 'Website',
        product: lead.product || 'Health Insurance',
        status: lead.status || 'New',
        budget: lead.budget ? lead.budget.toString() : '',
        assignedTo: lead.assignedTo || 'Raj Malhotra',
        priority: lead.priority || 'Medium',
        additionalInfo: lead.additionalInfo || '',
      });
    }
  }, [id, lead, form]);

  const onSubmit = async (values) => {
    try {
      console.log('Submitting lead data to MongoDB:', values);
      
      const leadData = {
        ...values,
        budget: values.budget ? parseInt(values.budget.replace(/[^0-9]/g, '')) : null,
      };

      if (isEditMode) {
        await updateLeadMutation.mutateAsync({ id, leadData });
        console.log('Lead updated successfully in MongoDB');
      } else {
        await createLeadMutation.mutateAsync(leadData);
        console.log('Lead created successfully in MongoDB');
      }
      navigate('/leads');
    } catch (error) {
      console.error('Error submitting lead to MongoDB:', error);
    }
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (error && id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h2>
          <p className="text-gray-600 mb-4">The requested lead could not be found in the database.</p>
          <Button onClick={() => navigate('/leads')}>Back to Leads</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Lead' : 'Create Lead'}</h2>
          <p className="text-muted-foreground">
            Connected to MongoDB • {isEditMode ? 'Update' : 'Create'} lead data in real-time
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input id="name" type="text" placeholder="John Doe" {...field} />
                )}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input id="email" type="email" placeholder="john.doe@example.com" {...field} />
                )}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Input id="phone" type="tel" placeholder="9876543210" {...field} />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Controller
                control={form.control}
                name="address"
                render={({ field }) => (
                  <Textarea id="address" placeholder="Full address" {...field} />
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Controller
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.source && (
                  <p className="text-red-500 text-sm">{form.formState.errors.source.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="product">Product Interest</Label>
                <Controller
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                        <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
                        <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
                        <SelectItem value="Home Insurance">Home Insurance</SelectItem>
                        <SelectItem value="Business Insurance">Business Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.product && (
                  <p className="text-red-500 text-sm">{form.formState.errors.product.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Not Interested">Not Interested</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && (
                  <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.priority && (
                  <p className="text-red-500 text-sm">{form.formState.errors.priority.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (₹)</Label>
                <Controller
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <Input id="budget" type="text" placeholder="50000" {...field} />
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Controller
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Raj Malhotra">Raj Malhotra</SelectItem>
                        <SelectItem value="Amit Kumar">Amit Kumar</SelectItem>
                        <SelectItem value="Sunita Verma">Sunita Verma</SelectItem>
                        <SelectItem value="Vikash Sharma">Vikash Sharma</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.assignedTo && (
                  <p className="text-red-500 text-sm">{form.formState.errors.assignedTo.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Controller
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <Textarea id="additionalInfo" placeholder="Any additional notes or requirements" {...field} />
                )}
              />
            </div>
            
            <CardFooter className="px-0">
              <div className="flex gap-4 w-full">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/leads')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!form.formState.isValid || createLeadMutation.isLoading || updateLeadMutation.isLoading}
                  className="flex-1"
                >
                  {createLeadMutation.isLoading || updateLeadMutation.isLoading 
                    ? 'Saving...' 
                    : isEditMode ? 'Update Lead' : 'Create Lead'
                  }
                </Button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
