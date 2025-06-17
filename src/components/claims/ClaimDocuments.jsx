
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { getDocumentTypes } from '@/config/insuranceTypes';

const ClaimDocuments = ({ claim, setClaim }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');

  const documentTypes = getDocumentTypes(claim.policyType);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF, DOC, DOCX, or image files only');
        return;
      }
      
      setSelectedFile(file);
      setDocumentName(file.name);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    // In a real app, this would upload to server
    const newDocument = {
      id: Date.now(),
      name: documentName || selectedFile.name,
      type: documentType,
      size: selectedFile.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User'
    };

    setClaim(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDocument]
    }));

    toast.success('Document uploaded successfully');
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setDocumentType('');
    setDocumentName('');
  };

  const handleDelete = (documentId) => {
    setClaim(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
    toast.success('Document deleted successfully');
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return '📷';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    }
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents ({claim.documents?.length || 0})</CardTitle>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document for this {claim.policyType?.toLowerCase()} claim
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name</Label>
                <Input
                  id="documentName"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name (optional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">Select File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!claim.documents || claim.documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload documents to support your claim</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claim.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(doc.name)}</span>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{getDocumentTypeLabel(doc.type)}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimDocuments;
