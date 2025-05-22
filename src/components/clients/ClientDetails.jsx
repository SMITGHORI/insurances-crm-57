
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Building, Group, Mail, Phone, MapPin,
  Calendar, Briefcase, CreditCard, FileText, ShieldCheck,
  Edit, Trash, Users, FileSpreadsheet, ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ClientDetails = ({ client, onEditClient, onDeleteClient }) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const navigate = useNavigate();
  
  if (!client) return null;
  
  const getClientTypeIcon = () => {
    switch (client.type) {
      case 'Individual':
        return <User className="h-6 w-6 text-blue-500" />;
      case 'Corporate':
        return <Building className="h-6 w-6 text-purple-500" />;
      case 'Group':
        return <Group className="h-6 w-6 text-green-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const handleDeleteConfirmed = () => {
    onDeleteClient(client.id);
    toast.success("Client deleted successfully");
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                {getClientTypeIcon()}
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">{client.name}</CardTitle>
                <p className="text-sm text-gray-500 font-mono">{client.clientId}</p>
              </div>
            </div>
            <Badge className={client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{client.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{client.contact || 'No contact provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{client.location || 'No location provided'}</span>
              </div>
            </div>
            
            {client.type === 'Individual' && (
              <div className="space-y-2">
                {client.dob && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>DOB: {client.dob}</span>
                  </div>
                )}
                {client.occupation && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>Occupation: {client.occupation}</span>
                  </div>
                )}
                {client.panNumber && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>PAN: {client.panNumber}</span>
                  </div>
                )}
              </div>
            )}
            
            {client.type === 'Corporate' && (
              <div className="space-y-2">
                {client.registrationNo && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>Registration No: {client.registrationNo}</span>
                  </div>
                )}
                {client.gstNumber && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>GST: {client.gstNumber}</span>
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>Industry: {client.industry}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">Related Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-start p-2 h-auto" 
                onClick={() => navigate(`/policies?client=${client.id}`)}
              >
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                <span>{client.policies || 0} Policies</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-start p-2 h-auto" 
                onClick={() => navigate(`/claims?client=${client.id}`)}
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                <span>Claims</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-start p-2 h-auto" 
                onClick={() => navigate(`/invoices?client=${client.id}`)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-purple-500" />
                <span>Invoices</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-start p-2 h-auto" 
                onClick={() => navigate(`/quotations?client=${client.id}`)}
              >
                <ClipboardList className="h-4 w-4 mr-2 text-amber-500" />
                <span>Quotations</span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-4 mt-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)} 
            className="flex items-center text-red-600 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button onClick={() => onEditClient(client.id)} className="flex items-center">
            <Edit className="h-4 w-4 mr-1" />
            Edit Client
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
              All associated policies and data will remain but will no longer be linked to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmed}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientDetails;
