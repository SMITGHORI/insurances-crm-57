
import React from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  IdCard,
  FileLock,
  FileUp,
  Upload,
  X 
} from 'lucide-react';

const DocumentUpload = ({ documentUploads, onDocumentUpload }) => {
  // Document type definitions
  const documentTypes = [
    {
      id: 'pan',
      name: 'PAN Card',
      description: 'Upload scanned copy of PAN card',
      icon: <IdCard className="h-5 w-5 text-orange-500" />,
      acceptedFormats: '.jpg, .jpeg, .png, .pdf',
      data: documentUploads.pan
    },
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      description: 'Upload scanned copy of Aadhaar card (front and back)',
      icon: <IdCard className="h-5 w-5 text-blue-500" />,
      acceptedFormats: '.jpg, .jpeg, .png, .pdf',
      data: documentUploads.aadhaar
    },
    {
      id: 'idProof',
      name: 'Passport/Voter ID',
      description: 'Upload scanned copy of Passport or Voter ID',
      icon: <FileLock className="h-5 w-5 text-green-500" />,
      acceptedFormats: '.jpg, .jpeg, .png, .pdf',
      data: documentUploads.idProof
    },
    {
      id: 'addressProof',
      name: 'Address Proof',
      description: 'Upload utility bill, rental agreement or any valid address proof',
      icon: <FileUp className="h-5 w-5 text-purple-500" />,
      acceptedFormats: '.jpg, .jpeg, .png, .pdf',
      data: documentUploads.addressProof
    }
  ];

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Handle file input change
  const handleFileChange = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      onDocumentUpload(documentType, file);
    }
  };

  // Handle document removal
  const handleRemoveDocument = (documentType) => {
    // Reset document data for this type
    onDocumentUpload(documentType, null);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">KYC Documents</CardTitle>
        <CardDescription>
          Upload client's government identification documents for KYC verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes.map((document) => (
            <Card key={document.id} className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center mb-4">
                  {document.icon}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">{document.name}</h4>
                    <p className="text-xs text-gray-500">{document.description}</p>
                  </div>
                </div>

                {document.data ? (
                  <div className="bg-blue-50 rounded p-3 mb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900 truncate max-w-[200px]">
                          {document.data.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {formatFileSize(document.data.size)} • Uploaded on {new Date(document.data.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-600"
                        onClick={() => handleRemoveDocument(document.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${document.id}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept={document.acceptedFormats}
                      onChange={(e) => handleFileChange(document.id, e)}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                      <Upload className="h-6 w-6 mx-auto text-gray-400" />
                      <p className="text-sm font-medium mt-2">Drop file or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">Supported: {document.acceptedFormats}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Note: Maximum file size is 5MB. Please ensure all documents are clearly legible.
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
