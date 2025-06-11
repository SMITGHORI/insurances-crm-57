import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Trash, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const ClaimDocuments = ({ claim, setClaim }) => {
  const [uploading, setUploading] = useState(false);

  // Safely get documents array, defaulting to empty array if undefined
  const documents = claim?.documents || [];

  const handleUpload = () => {
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // Add a new document to the list
      const newDocument = {
        id: documents.length + 1,
        name: `Document-${Math.floor(Math.random() * 1000)}.pdf`,
        type: 'other',
        size: '1.2 MB',
        uploadedBy: 'Admin User',
        uploadDate: new Date().toLocaleDateString(),
        status: 'pending'
      };
      
      setClaim({
        ...claim,
        documents: [...documents, newDocument]
      });
      
      setUploading(false);
      toast.success('Document uploaded successfully!');
    }, 1500);
  };

  const handleDownload = (documentName) => {
    // In a real app, this would download the actual file
    toast.success(`Downloading ${documentName}`);
  };

  const handleDelete = (documentId) => {
    // Filter out the document with the given ID
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    
    setClaim({
      ...claim,
      documents: updatedDocuments
    });
    
    toast.success('Document deleted successfully!');
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'bill':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'report':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'prescription':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'form':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'identity':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Claim Documents</h2>
        <Button onClick={handleUpload} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(document => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getDocumentTypeIcon(document.type)}
                        <span className="ml-2">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell>{document.uploadedBy}</TableCell>
                    <TableCell>{document.uploadDate}</TableCell>
                    <TableCell>
                      {getDocumentStatusBadge(document.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Download document"
                          onClick={() => handleDownload(document.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete document"
                          onClick={() => handleDelete(document.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDocuments;
