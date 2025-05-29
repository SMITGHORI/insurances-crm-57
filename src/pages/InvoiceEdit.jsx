import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InvoiceSchema } from '@/lib/validations/invoice';
import { formatCurrency } from '@/lib/utils';
import { useInvoice, useUpdateInvoice } from '@/hooks/useInvoices';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const InvoiceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const { data: invoiceData, isLoading: isInvoiceLoading, error: invoiceError } = useInvoice(id);
  const updateInvoiceMutation = useUpdateInvoice();

  const form = useForm({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceNumber: '',
      issueDate: new Date(),
      dueDate: new Date(),
      totalAmount: 0,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (invoiceData) {
      form.reset(invoiceData);
    }
    setLoading(false);
  }, [invoiceData, form]);

  const onSubmit = async (values) => {
    try {
      await updateInvoiceMutation.mutateAsync({ id, ...values });
      toast.success('Invoice updated successfully');
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <Button onClick={() => navigate('/invoices')} variant="outline">
          Back to Invoices
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input id="clientId" type="text" {...form.register('clientId')} />
              {form.formState.errors.clientId && (
                <p className="text-red-500">{form.formState.errors.clientId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" type="text" {...form.register('invoiceNumber')} />
              {form.formState.errors.invoiceNumber && (
                <p className="text-red-500">{form.formState.errors.invoiceNumber.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" {...form.register('issueDate')} />
              {form.formState.errors.issueDate && (
                <p className="text-red-500">{form.formState.errors.issueDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...form.register('dueDate')} />
              {form.formState.errors.dueDate && (
                <p className="text-red-500">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input id="totalAmount" type="number" {...form.register('totalAmount')} />
              {form.formState.errors.totalAmount && (
                <p className="text-red-500">{form.formState.errors.totalAmount.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" type="text" {...form.register('status')} />
              {form.formState.errors.status && (
                <p className="text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
            <Button type="submit" disabled={updateInvoiceMutation.isLoading}>
              {updateInvoiceMutation.isLoading ? 'Updating...' : 'Update Invoice'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceEdit;
