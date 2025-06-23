
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Trash2, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

const AgentDocuments = ({ agentId }) => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Insurance License',
      type: 'license',
      url: '/docs/license.pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      status: 'verified'
    },
    {
      id: '2',
      name: 'Training Certificate',
      type: 'certificate',
      url: '/docs/training.pdf',
      size: '1.8 MB',
      uploadedAt: '2024-01-10',
      status: 'pending'
    }
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    name: '',
    type: ''
  });

  const documentTypes = [
    { value: 'license', label: 'License' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'id', label: 'ID Document' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, name: file.name }));
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.type) {
      toast.error('Please fill all required fields');
      return;
    }

    const newDocument = {
      id: Date.now().toString(),
      name: uploadForm.name,
      type: uploadForm.type,
      url: '#',
      size: `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setDocuments(prev => [...prev, newDocument]);
    setUploadForm({ file: null, name: '', type: '' });
    setIsUploadOpen(false);
    toast.success('Document uploaded successfully');
  };

  const handleDeleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Documents</h3>
          <p className="text-sm text-gray-600">Manage agent documents and certificates</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document for this agent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">File</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Document Name</label>
                <Input
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter document name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <Select 
                  value={uploadForm.type} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadSubmit}>
                <Upload size={16} className="mr-2" />
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.size} • Uploaded {doc.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(doc.status)}
                  <Button variant="ghost" size="sm">
                    <Download size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-500">Upload documents to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentDocuments;
