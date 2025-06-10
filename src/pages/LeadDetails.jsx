
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, User, Edit, ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import LeadFollowUps from '@/components/leads/LeadFollowUps';
import LeadNotes from '@/components/leads/LeadNotes';
import LeadAssignDialog from '@/components/leads/LeadAssignDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useLead, useDeleteLead } from '@/hooks/useLeads';

const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'bg-blue-500';
    case 'In Progress':
      return 'bg-yellow-500';
    case 'Qualified':
      return 'bg-green-500';
    case 'Closed':
      return 'bg-gray-500';
    case 'Lost':
      return 'bg-red-500';
    case 'Not Interested':
      return 'bg-red-500';
    case 'Converted':
      return 'bg-green-600';
    default:
      return 'bg-gray-500';
  }
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('followups');
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 768;

  // Use React Query to fetch lead data
  const { data: lead, isLoading, error } = useLead(id);
  const deleteLeadMutation = useDeleteLead();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  const handleDelete = async () => {
    try {
      await deleteLeadMutation.mutateAsync(id);
      setShowDeleteDialog(false);
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleConvertToClient = () => {
    // In a real app, this would call an API endpoint to convert the lead to a client
    toast.success(`Lead "${lead.name}" converted to client successfully`);
    navigate('/clients');
  };

  const handleCreateQuotation = () => {
    // Navigate to quotation creation page with lead info
    navigate('/quotations/create', { state: { leadId: lead.id, leadName: lead.name } });
  };

  // Show professional loading skeleton
  if (loading || isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Show error state
  if (error || !lead) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/leads')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        <p className="text-red-600">
          {error ? `Error loading lead: ${error.message}` : 'Lead not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/leads')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              {lead.name}
              <Badge className={`ml-4 ${getStatusColor(lead.status)} text-white`}>
                {lead.status}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500">Lead ID: {lead.leadId || lead.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-end sm:self-auto">
          <Button 
            variant="outline"
            onClick={() => setShowAssignDialog(true)}
          >
            <User className="h-4 w-4 mr-2" />
            Reassign
          </Button>
          <Button 
            variant="secondary"
            onClick={handleConvertToClient}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Convert to Client
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/leads/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Lead information cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{lead.phone}</p>
                <p className="text-sm text-gray-500">Phone</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{lead.email}</p>
                <p className="text-sm text-gray-500">Email</p>
              </div>
            </div>
            {lead.address && (
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{lead.address}</p>
                  <p className="text-sm text-gray-500">Address</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Source</p>
              <p className="font-medium">{lead.source}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-medium">{lead.product}</p>
            </div>
            {lead.budget && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">₹{lead.budget.toLocaleString()}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-medium">{lead.priority}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tracking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Assigned To</p>
              <div className="flex items-center">
                <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                <p className="font-medium">{lead.assignedTo}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">{lead.createdAt}</p>
            </div>
            {lead.lastInteraction && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Last Interaction</p>
                <p className="font-medium">{lead.lastInteraction}</p>
              </div>
            )}
            {lead.nextFollowUp && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Next Follow-up</p>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  <p className="font-medium text-blue-600">{lead.nextFollowUp}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={handleCreateQuotation}>Create Quotation</Button>
      </div>

      {/* Additional information */}
      {lead.additionalInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{lead.additionalInfo}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for follow-ups and notes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="followups">
          <LeadFollowUps lead={lead} />
        </TabsContent>
        <TabsContent value="notes">
          <LeadNotes lead={lead} />
        </TabsContent>
      </Tabs>

      {/* Assign Dialog */}
      <LeadAssignDialog 
        lead={lead} 
        open={showAssignDialog} 
        onOpenChange={setShowAssignDialog} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLeadMutation.isLoading}
            >
              {deleteLeadMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LeadDetails;
