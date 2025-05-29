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
import { useLeads, useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const leadFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  status: z.string().min(2, { message: "Status is required." }),
  source: z.string().min(2, { message: "Source is required." }),
  assignedTo: z.string().min(2, { message: "Assigned agent is required." }),
  priority: z.string().min(2, { message: "Priority is required." }),
  notes: z.string().optional(),
});

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: leadData } = useLeads({ id });
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const form = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'new',
      source: 'web',
      assignedTo: 'john.doe@example.com',
      priority: 'low',
      notes: '',
    },
    mode: "onChange"
  });

  useEffect(() => {
    if (id && leadData?.data) {
      setIsEditMode(true);
      form.reset(leadData.data);
    }
  }, [id, leadData, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await updateLeadMutation.mutateAsync({ id, ...values });
        toast.success("Lead updated successfully!");
      } else {
        await createLeadMutation.mutateAsync(values);
        toast.success("Lead created successfully!");
      }
      navigate('/leads');
    } catch (error) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Show professional loading skeleton
  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Lead' : 'Create Lead'}</h2>
          <p className="text-muted-foreground">Fill out the form below to {isEditMode ? 'update' : 'create'} a lead.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Controller
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <Input id="firstName" type="text" placeholder="John" {...field} />
                )}
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Controller
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <Input id="lastName" type="text" placeholder="Doe" {...field} />
                )}
              />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
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
                  <Input id="phone" type="tel" placeholder="123-456-7890" {...field} />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Controller
                control={form.control}
                name="source"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.source && (
                <p className="text-red-500 text-sm">{form.formState.errors.source.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Controller
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <Input id="assignedTo" type="email" placeholder="john.doe@example.com" {...field} />
                )}
              />
              {form.formState.errors.assignedTo && (
                <p className="text-red-500 text-sm">{form.formState.errors.assignedTo.message}</p>
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
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.priority && (
                <p className="text-red-500 text-sm">{form.formState.errors.priority.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea id="notes" placeholder="Additional notes" {...field} />
                )}
              />
            </div>
            <CardFooter>
              <Button type="submit" disabled={!form.formState.isValid || loading}>
                {isEditMode ? 'Update Lead' : 'Create Lead'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
