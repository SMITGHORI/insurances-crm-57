
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Edit3 } from 'lucide-react';
// Define insurance carriers locally
const insuranceCarriers = [
  'HDFC ERGO',
  'ICICI Lombard',
  'LIC',
  'Star Health',
  'Bajaj Allianz',
  'New India Assurance',
  'Oriental Insurance',
  'United India Insurance',
  'SBI General',
  'IFFCO Tokio'
];
import { toast } from 'sonner';

interface QuoteUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const QuoteUploadDialog: React.FC<QuoteUploadDialogProps> = ({
  open,
  onClose,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState({
    carrier: '',
    premium: '',
    coverageAmount: '',
    planName: '',
    validityStart: '',
    validityEnd: '',
    insuranceType: '',
    leadId: '',
  });
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);

    // Call OCR extraction API
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/quotes/extract', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract quote data');
      }
      
      const extractedData = await response.json();
      setExtractedData({
        carrier: extractedData.carrier || '',
        premium: extractedData.premium || '',
        coverageAmount: extractedData.coverageAmount || '',
        planName: extractedData.planName || '',
        validityStart: extractedData.validityStart || new Date().toISOString().split('T')[0],
        validityEnd: extractedData.validityEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        insuranceType: extractedData.insuranceType || '',
        leadId: extractedData.leadId || '',
      });
      setIsExtracting(false);
      toast.success('Quote data extracted successfully! Please review and correct if needed.');
    } catch (error) {
      console.error('OCR extraction failed:', error);
      setIsExtracting(false);
      toast.error('Failed to extract quote data. Please fill in manually.');
      // Set empty data for manual entry
      setExtractedData({
        carrier: '',
        premium: '',
        coverageAmount: '',
        planName: '',
        validityStart: new Date().toISOString().split('T')[0],
        validityEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        insuranceType: '',
        leadId: '',
      });
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['carrier', 'premium', 'coverageAmount', 'planName', 'validityEnd', 'leadId'];
    const missingFields = requiredFields.filter(field => !extractedData[field as keyof typeof extractedData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quote');
      }
      
      toast.success('Quote saved successfully!');
      onClose();
      
      // Reset form
      setUploadedFile(null);
      setExtractedData({
        carrier: '',
        premium: '',
        coverageAmount: '',
        planName: '',
        validityStart: '',
        validityEnd: '',
        insuranceType: '',
        leadId: '',
      });
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast.error('Failed to save quote. Please try again.');
    }
  };

  const insuranceTypes = [
    'Health Insurance',
    'Life Insurance',
    'Motor Insurance',
    'Home Insurance',
    'Travel Insurance',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Quote Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium">Upload PDF or Screenshot</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {uploadedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>

          {/* Extraction Status */}
          {isExtracting && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm text-blue-800">Extracting quote data...</span>
              </div>
            </div>
          )}

          {/* Manual Correction Form */}
          {uploadedFile && !isExtracting && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Edit3 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Review and correct extracted data
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadId">Lead ID *</Label>
                  <Input
                    id="leadId"
                    value={extractedData.leadId}
                    onChange={(e) => setExtractedData({ ...extractedData, leadId: e.target.value })}
                    placeholder="LD000001"
                  />
                </div>

                <div>
                  <Label htmlFor="insuranceType">Insurance Type</Label>
                  <Select
                    value={extractedData.insuranceType}
                    onValueChange={(value) => setExtractedData({ ...extractedData, insuranceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {insuranceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="carrier">Insurance Carrier *</Label>
                  <Select
                    value={extractedData.carrier}
                    onValueChange={(value) => setExtractedData({ ...extractedData, carrier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {insuranceCarriers.map((carrier) => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="planName">Plan/Policy Name *</Label>
                  <Input
                    id="planName"
                    value={extractedData.planName}
                    onChange={(e) => setExtractedData({ ...extractedData, planName: e.target.value })}
                    placeholder="Health Secure Plus"
                  />
                </div>

                <div>
                  <Label htmlFor="premium">Premium Amount (₹) *</Label>
                  <Input
                    id="premium"
                    type="number"
                    value={extractedData.premium}
                    onChange={(e) => setExtractedData({ ...extractedData, premium: e.target.value })}
                    placeholder="25000"
                  />
                </div>

                <div>
                  <Label htmlFor="coverageAmount">Coverage Amount (₹) *</Label>
                  <Input
                    id="coverageAmount"
                    type="number"
                    value={extractedData.coverageAmount}
                    onChange={(e) => setExtractedData({ ...extractedData, coverageAmount: e.target.value })}
                    placeholder="500000"
                  />
                </div>

                <div>
                  <Label htmlFor="validityStart">Validity Start Date</Label>
                  <Input
                    id="validityStart"
                    type="date"
                    value={extractedData.validityStart}
                    onChange={(e) => setExtractedData({ ...extractedData, validityStart: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="validityEnd">Validity End Date *</Label>
                  <Input
                    id="validityEnd"
                    type="date"
                    value={extractedData.validityEnd}
                    onChange={(e) => setExtractedData({ ...extractedData, validityEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!uploadedFile || isExtracting}
          >
            Save Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteUploadDialog;
