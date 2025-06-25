
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ClaimDocuments = ({ claimId }) => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Incident Report',
      fileName: 'incident_report.pdf',
      fileSize: 2450000,
      documentType: 'incident_report',
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'Agent John'
    },
    {
      id: '2',
      name: 'Police Report',
      fileName: 'police_report.pdf',
      fileSize: 1850000,
      documentType: 'police_report',
      uploadedAt: '2024-01-16T14:20:00Z',
      uploadedBy: 'Agent Smith'
    },
    {
      id: '3',
      name: 'Medical Report',
      fileName: 'medical_report.pdf',
      fileSize: 3200000,
      documentType: 'medical_report',
      uploadedAt: '2024-01-18T09:15:00Z',
      uploadedBy: 'Agent John'
    }
  ]);

  const getDocumentTypeLabel = (type) => {
    const types = {
      'incident_report': 'Incident Report',
      'police_report': 'Police Report',
      'medical_report': 'Medical Report',
      'repair_estimate': 'Repair Estimate',
      'receipt': 'Receipt',
      'photo_evidence': 'Photo Evidence',
      'witness_statement': 'Witness Statement',
      'insurance_form': 'Insurance Form',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const getDocumentTypeBadge = (type) => {
    const colors = {
      'incident_report': 'bg-red-100 text-red-800',
      'police_report': 'bg-blue-100 text-blue-800',
      'medical_report': 'bg-green-100 text-green-800',
      'repair_estimate': 'bg-yellow-100 text-yellow-800',
      'receipt': 'bg-purple-100 text-purple-800',
      'photo_evidence': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
      {getDocumentTypeLabel(type)}
    </Badge>;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadDocument = () => {
    toast.success('Document upload initiated');
  };

  const handleDownloadDocument = (documentId) => {
    toast.success('Download started');
  };

  const handleViewDocument = (documentId) => {
    toast.info('Opening document viewer');
  };

  const handleDeleteDocument = (documentId) => {
    setDocuments(docs => docs.filter(doc => doc.id !== documentId));
    toast.success('Document deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Claim Documents</h3>
          <p className="text-sm text-gray-600">Manage documents related to this claim</p>
        </div>
        <Button onClick={handleUploadDocument}>
          <Plus size={16} className="mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map(document => (
          <Card key={document.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-10 w-10 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-gray-500">{document.fileName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getDocumentTypeBadge(document.documentType)}
                      <span className="text-xs text-gray-400">
                        {formatFileSize(document.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDocument(document.id)}>
                    <Eye size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(document.id)}>
                    <Download size={14} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Uploaded on {new Date(document.uploadedAt).toLocaleDateString()} by {document.uploadedBy}
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
            <p className="text-gray-500 mb-4">Upload documents related to this claim</p>
            <Button onClick={handleUploadDocument}>
              <Upload size={16} className="mr-2" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClaimDocuments;
