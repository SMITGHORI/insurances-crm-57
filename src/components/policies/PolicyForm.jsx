
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

const PolicyForm = ({ policy, onSave, clients: providedClients, isNew = false }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(providedClients || []);
  const [loading, setLoading] = useState(!providedClients);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      ...policy,
      clientId: policy?.client?.id || '',
    }
  });

  const selectedClientId = watch('clientId');

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
    
    // Format the data
    const formattedData = {
      ...policy,
      ...data,
      sumAssured: data.sumAssured.toString(),
      premium: data.premium.toString(),
      client: {
        id: selectedClient.id,
        name: selectedClient.name
      }
    };
    
    // Remove clientId as it's now in the client object
    delete formattedData.clientId;
    
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

          {/* Policy Type */}
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
                <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
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
