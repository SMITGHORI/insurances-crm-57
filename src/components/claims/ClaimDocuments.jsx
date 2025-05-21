
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  Download, 
  Plus, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Trash,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ClaimDocuments = ({ claim, setClaim }) => {
  const [newDocument, setNewDocument] = useState({
    type: '',
    status: 'Required',
    file: null,
    comments: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get document type suggestions based on policy type
  const getDocumentTypeSuggestions = () => {
    const documentTypes = [
      'Identity Proof',
      'Policy Document'
    ];
    
    if (claim.type === 'Health Insurance') {
      documentTypes.push(
        'Hospital Bills',
        'Medical Reports',
        'Prescription',
        'Discharge Summary',
        'Doctor Certificate',
        'Test Reports',
        'Pre-authorization Form'
      );
    } else if (claim.type === 'Motor Insurance') {
      documentTypes.push(
        'Accident Photos',
        'Police Report',
        'Driving License',
        'RC Book Copy',
        'Repair Estimate',
        'Repair Bills',
        'Surveyor Report'
      );
    } else if (claim.type === 'Life Insurance') {
      documentTypes.push(
        'Medical Reports',
        'Doctor Certificate',
        'Pathology Reports',
        'Death Certificate',
        'Post-mortem Report',
        'Legal Heir Certificate',
        'Bank Details'
      );
    }
    
    return documentTypes;
  };

  const handleAddDocument = () => {
    if (!newDocument.type) {
      toast.error('Please select document type');
      return;
    }
    
    // Get current claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the claim to update
    const claimIndex = claimsList.findIndex(c => c.id === claim.id);
    
    if (claimIndex !== -1) {
      // Initialize documents array if it doesn't exist
      if (!claimsList[claimIndex].documents) {
        claimsList[claimIndex].documents = [];
      }
      
      // Add new document
      const updatedDocumentsList = [
        ...claimsList[claimIndex].documents,
        {
          type: newDocument.type,
          status: newDocument.status,
          file: null, // Would need file upload integration
          comments: newDocument.comments,
          addedAt: new Date().toISOString()
        }
      ];
      
      // Update the claim with new documents
      claimsList[claimIndex].documents = updatedDocumentsList;
      
      // Save updated claims list back to localStorage
      localStorage.setItem('claimsData', JSON.stringify(claimsList));
      
      // Update the claim in state
      setClaim({
        ...claim,
        documents: updatedDocumentsList
      });
      
      // Reset form and close dialog
      setNewDocument({
        type: '',
        status: 'Required',
        file: null,
        comments: ''
      });
      setDialogOpen(false);
      
      toast.success('Document added successfully');
    } else {
      toast.error('Failed to add document');
    }
  };

  const handleRemoveDocument = (index) => {
    // Get current claims from localStorage
    const storedClaimsData = localStorage.getItem('claimsData');
    let claimsList = [];
    
    if (storedClaimsData) {
      claimsList = JSON.parse(storedClaimsData);
    }
    
    // Find the claim to update
    const claimIndex = claimsList.findIndex(c => c.id === claim.id);
    
    if (claimIndex !== -1 && claimsList[claimIndex].documents) {
      // Remove document at specified index
      const updatedDocumentsList = claimsList[claimIndex].documents.filter((_, i) => i !== index);
      
      // Update the claim with new documents list
      claimsList[claimIndex].documents = updatedDocumentsList;
      
      // Save updated claims list back to localStorage
      localStorage.setItem('claimsData', JSON.stringify(claimsList));
      
      // Update the claim in state
      setClaim({
        ...claim,
        documents: updatedDocumentsList
      });
      
      toast.success('Document removed successfully');
    } else {
      toast.error('Failed to remove document');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Uploaded':
        return <Badge className="bg-green-100 text-green-800">Uploaded</Badge>;
      case 'Required':
        return <Badge className="bg-amber-100 text-amber-800">Required</Badge>;
      case 'Pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Uploaded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Required':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'Pending':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  // Prepare the list of documents
  const documentsList = claim.documents || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Documents</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Required Document</DialogTitle>
              <DialogDescription>
                Add documents required for this claim or upload evidence.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="documentType">Document Type</label>
                <Select 
                  value={newDocument.type} 
                  onValueChange={(value) => setNewDocument({...newDocument, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDocumentTypeSuggestions().map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="documentStatus">Status</label>
                <Select 
                  value={newDocument.status} 
                  onValueChange={(value) => setNewDocument({...newDocument, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Required">Required</SelectItem>
                    <SelectItem value="Uploaded">Uploaded</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="documentComments">Comments</label>
                <Textarea 
                  id="documentComments"
                  placeholder="Add any comments about this document"
                  value={newDocument.comments}
                  onChange={(e) => setNewDocument({...newDocument, comments: e.target.value})}
                />
              </div>
              {newDocument.status === 'Uploaded' && (
                <div className="grid gap-2">
                  <label htmlFor="documentFile">Upload File</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="documentFile" 
                      type="file"
                      disabled
                    />
                    <Button variant="outline" size="sm" disabled>
                      <Upload className="h-4 w-4 mr-1" /> Upload
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    * File upload functionality will be implemented with cloud storage integration
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDocument}>Add Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documentsList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsList.map((document, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      {document.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </TableCell>
                  <TableCell>{document.comments || '-'}</TableCell>
                  <TableCell>
                    {document.addedAt ? new Date(document.addedAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {document.file && (
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveDocument(index)}
                      >
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              No documents have been added for this claim yet. Add required documents or upload evidence.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimDocuments;
