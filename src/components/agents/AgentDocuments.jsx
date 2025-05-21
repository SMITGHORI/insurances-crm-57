
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

const AgentDocuments = ({ agentId, agent }) => {
  // Document types and their status
  const [documents, setDocuments] = useState({
    idProof: {
      name: 'ID Proof',
      status: agent.documents?.idProof ? 'uploaded' : 'missing',
      file: agent.documents?.idProof || null,
      description: 'Aadhar Card, PAN Card, Passport or Voter ID',
      required: true
    },
    addressProof: {
      name: 'Address Proof',
      status: agent.documents?.addressProof ? 'uploaded' : 'missing',
      file: agent.documents?.addressProof || null,
      description: 'Utility Bill, Bank Statement, etc.',
      required: true
    },
    licenseDocument: {
      name: 'Insurance License',
      status: agent.documents?.licenseDocument ? 'uploaded' : 'missing',
      file: agent.documents?.licenseDocument || null,
      description: 'Valid IRDA license certificate',
      required: true
    },
    agreementCopy: {
      name: 'Agency Agreement',
      status: agent.documents?.agreementCopy ? 'uploaded' : 'missing',
      file: agent.documents?.agreementCopy || null,
      description: 'Signed agreement between agent and company',
      required: true
    },
    bankDetailsProof: {
      name: 'Bank Account Proof',
      status: agent.documents?.bankDetailsProof ? 'uploaded' : 'missing',
      file: agent.documents?.bankDetailsProof || null,
      description: 'Cancelled Cheque or Bank Statement',
      required: false
    },
  });

  // Handle file upload
  const handleFileUpload = (documentType) => {
    // In a real application, this would open a file picker and upload the file
    // For now, we'll simulate a successful upload
    
    // Create a fake file object
    const mockFile = {
      name: `${documentType}_${agentId}.pdf`,
      type: 'application/pdf',
      size: 1024 * 1024 * (1 + Math.random()), // Random size between 1-2 MB
      lastModified: new Date().getTime()
    };
    
    // Update documents state
    setDocuments(prevDocs => ({
      ...prevDocs,
      [documentType]: {
        ...prevDocs[documentType],
        status: 'uploaded',
        file: mockFile
      }
    }));
    
    // Show success notification
    toast.success(`${documents[documentType].name} uploaded successfully`);
  };

  // Handle file view
  const handleFileView = (documentType) => {
    // In a real application, this would open the file for viewing
    // For now, we'll just show an alert
    toast.info(`Viewing ${documents[documentType].name}`);
  };

  // Calculate verification status
  const getVerificationStatus = () => {
    const requiredDocs = Object.values(documents).filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => doc.status === 'uploaded');
    
    if (uploadedRequiredDocs.length === requiredDocs.length) {
      return 'complete';
    } else if (uploadedRequiredDocs.length > 0) {
      return 'partial';
    } else {
      return 'none';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'uploaded':
        return 'amba-badge-green';
      case 'missing':
        return 'amba-badge-red';
      case 'pending':
        return 'amba-badge-yellow';
      default:
        return 'amba-badge-gray';
    }
  };

  // Render verification status banner
  const renderVerificationStatus = () => {
    const status = getVerificationStatus();
    
    let badgeClass = '';
    let icon = null;
    let message = '';
    
    switch (status) {
      case 'complete':
        badgeClass = 'bg-green-50 border-green-200 text-green-800';
        icon = <FileCheck className="h-5 w-5 text-green-500 mr-2" />;
        message = 'All required documents have been uploaded.';
        break;
      case 'partial':
        badgeClass = 'bg-yellow-50 border-yellow-200 text-yellow-800';
        icon = <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />;
        message = 'Some required documents are still missing.';
        break;
      case 'none':
        badgeClass = 'bg-red-50 border-red-200 text-red-800';
        icon = <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />;
        message = 'No required documents have been uploaded.';
        break;
      default:
        break;
    }
    
    return (
      <div className={`flex items-center p-4 rounded-lg border ${badgeClass} mb-6`}>
        {icon}
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="p-5">
      {renderVerificationStatus()}
      
      <div className="space-y-6">
        {Object.entries(documents).map(([key, doc]) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
              </div>
              
              <div className="flex items-center">
                <span className={`amba-badge mr-4 ${getStatusBadgeClass(doc.status)}`}>
                  {doc.status === 'uploaded' ? 'Uploaded' : 'Missing'}
                </span>
                
                {doc.status === 'uploaded' ? (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center text-blue-700"
                      onClick={() => handleFileView(key)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center text-green-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="flex items-center"
                    onClick={() => handleFileUpload(key)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                )}
              </div>
            </div>
            
            {doc.status === 'uploaded' && doc.file && (
              <div className="mt-3 text-xs text-gray-500">
                Uploaded file: {doc.file.name} ({Math.round(doc.file.size / 1024)} KB)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentDocuments;
