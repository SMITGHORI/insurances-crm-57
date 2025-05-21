
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Phone, Mail, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const LeadFollowUps = ({ lead }) => {
  const [followUps, setFollowUps] = useState(lead.followUps || []);
  const [openDialog, setOpenDialog] = useState(false);
  
  const form = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      type: '',
      outcome: '',
      nextAction: '',
    }
  });

  const getFollowUpIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'Email':
        return <Mail className="h-5 w-5 text-green-500" />;
      case 'Meeting':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAddFollowUp = (data) => {
    const newFollowUp = {
      id: followUps.length + 1,
      ...data,
      createdBy: 'Raj Malhotra', // In a real app, this would come from the current user
    };
    
    setFollowUps([newFollowUp, ...followUps]);
    setOpenDialog(false);
    form.reset();
    toast.success('Follow-up added successfully');
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Follow-up History</h2>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Follow-up
        </Button>
      </div>
      
      {followUps.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No follow-ups recorded for this lead yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {followUps.map((followUp) => (
            <Card key={followUp.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left sidebar with date and time */}
                  <div className="bg-gray-50 p-4 md:p-6 md:w-1/4 flex flex-row md:flex-col items-center md:items-start">
                    <div className="mr-4 md:mr-0 md:mb-4">
                      {getFollowUpIcon(followUp.type)}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span className="text-sm">{followUp.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span className="text-sm">{followUp.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main content */}
                  <div className="p-4 md:p-6 md:w-3/4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {followUp.type} Follow-up
                      </h3>
                      <span className="text-sm text-gray-500">by {followUp.createdBy}</span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Outcome</h4>
                      <p>{followUp.outcome}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Next Action</h4>
                      <p>{followUp.nextAction}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Follow-up Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Follow-up</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddFollowUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outcome</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the outcome of this follow-up" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nextAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Action</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the next action to take" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadFollowUps;
