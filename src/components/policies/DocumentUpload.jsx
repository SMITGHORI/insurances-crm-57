
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Download, Trash } from 'lucide-react';
import { toast } from 'sonner';

const DocumentUpload = ({ policy, setPolicy }) => {
  const handleDocumentUpload = (documentType, file) => {
    if (!file) return;

    // In a real application, you would upload the file to a server
    // For this example, we'll create a data URL to simulate file storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedPolicy = {
        ...policy,
        documents: {
          ...policy.documents,
          [documentType]: {
            name: file.name,
            type: file.type,
            size: file.size,
            url: event.target.result,
            uploadDate: new Date().toISOString()
          }
        }
      };
      
      // Add history entry
      if (!updatedPolicy.history) {
        updatedPolicy.history = [];
      }
      
      updatedPolicy.history.push({
        action: 'Document Uploaded',
        by: 'Admin',
        timestamp: new Date().toISOString(),
        details: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded`
      });
      
      // Update the policy in localStorage
      const storedPoliciesData = localStorage.getItem('policiesData');
      if (storedPoliciesData) {
        const policiesList = JSON.parse(storedPoliciesData);
        const policyIndex = policiesList.findIndex(p => p.id === policy.id);
        
        if (policyIndex !== -1) {
          policiesList[policyIndex] = updatedPolicy;
          localStorage.setItem('policiesData', JSON.stringify(policiesList));
        }
      }
      
      setPolicy(updatedPolicy);
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`);
    };
    
    reader.onerror = () => {
      toast.error(`Failed to process ${documentType} document`);
    };
    
    reader.readAsDataURL(file);
  };

  const handleDocumentDelete = (documentType) => {
    const updatedPolicy = {
      ...policy,
      documents: {
        ...policy.documents,
        [documentType]: null
      }
    };
    
    // Add history entry
    if (!updatedPolicy.history) {
      updatedPolicy.history = [];
    }
    
    updatedPolicy.history.push({
      action: 'Document Deleted',
      by: 'Admin',
      timestamp: new Date().toISOString(),
      details: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document deleted`
    });
    
    // Update the policy in localStorage
    const storedPoliciesData = localStorage.getItem('policiesData');
    if (storedPoliciesData) {
      const policiesList = JSON.parse(storedPoliciesData);
      const policyIndex = policiesList.findIndex(p => p.id === policy.id);
      
      if (policyIndex !== -1) {
        policiesList[policyIndex] = updatedPolicy;
        localStorage.setItem('policiesData', JSON.stringify(policiesList));
      }
    }
    
    setPolicy(updatedPolicy);
    toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document deleted successfully`);
  };

  const handleDownload = (document, documentType) => {
    if (!document || !document.url) {
      toast.error('Document not available for download');
      return;
    }
    
    const link = document.url;
    const fileName = document.name || `${documentType}.${document.type.split('/')[1]}`;
    
    const a = document.createElement('a');
    a.href = link;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const documentTypes = [
    { key: 'proposalForm', label: 'Proposal Form' },
    { key: 'policyBond', label: 'Policy Bond' },
    { key: 'welcomeLetter', label: 'Welcome Letter' },
    { key: 'policySchedule', label: 'Policy Schedule' },
    { key: 'endorsements', label: 'Endorsements' },
    { key: 'cancellationLetter', label: 'Cancellation Letter' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes.map((docType) => (
            <div key={docType.key} className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{docType.label}</h3>
              
              {policy.documents && policy.documents[docType.key] ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex-1 truncate">
                      <p className="font-medium truncate">{policy.documents[docType.key].name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(policy.documents[docType.key].size)} • 
                        {new Date(policy.documents[docType.key].uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDownload(policy.documents[docType.key], docType.key)}
                      >
                        <Download size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500" 
                        onClick={() => handleDocumentDelete(docType.key)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor={`upload-${docType.key}`} 
                      className="cursor-pointer flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-3 rounded-md w-full"
                    >
                      <Upload size={16} />
                      <span>Upload {docType.label}</span>
                    </Label>
                  </div>
                  <Input 
                    type="file" 
                    id={`upload-${docType.key}`} 
                    className="hidden" 
                    onChange={(e) => handleDocumentUpload(docType.key, e.target.files[0])} 
                    accept="application/pdf,image/*"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accept PDF or image files
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
