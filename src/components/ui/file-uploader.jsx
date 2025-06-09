
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const FileUploader = ({ 
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileUpload,
  currentFile,
  className = ""
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      toast.error(`File size should be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    onFileUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    onFileUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {currentFile ? (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{currentFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(currentFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: {accept} (Max {Math.round(maxSize / (1024 * 1024))}MB)
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
