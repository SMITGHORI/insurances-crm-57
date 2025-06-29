
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Users, Eye } from 'lucide-react';
import { Quote } from '@/__mocks__/quotes';
import { emailTemplates } from '@/__mocks__/quotes';

interface EmailSendDialogProps {
  open: boolean;
  onClose: () => void;
  selectedQuotes: string[];
  quotes: Quote[];
  onSend: (template: string) => void;
}

const EmailSendDialog: React.FC<EmailSendDialogProps> = ({
  open,
  onClose,
  selectedQuotes,
  quotes,
  onSend,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = () => {
    if (!selectedTemplate) return;
    onSend(selectedTemplate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPreviewHtml = (quote: Quote) => {
    if (!selectedTemplate || !emailTemplates[selectedTemplate as keyof typeof emailTemplates]) {
      return '';
    }

    const template = emailTemplates[selectedTemplate as keyof typeof emailTemplates];
    return template.template
      .replace(/{{clientName}}/g, quote.leadName)
      .replace(/{{quoteid}}/g, quote.quoteId)
      .replace(/{{planName}}/g, quote.planName)
      .replace(/{{carrier}}/g, quote.carrier)
      .replace(/{{premium}}/g, formatCurrency(quote.premium))
      .replace(/{{coverage}}/g, formatCurrency(quote.coverageAmount))
      .replace(/{{validityEnd}}/g, new Date(quote.validityEnd).toLocaleDateString('en-IN'))
      .replace(/{{acceptUrl}}/g, `https://app.ambainsurance.com/quotes/${quote.id}/accept`);
  };

  const templateOptions = Object.keys(emailTemplates).map(key => ({
    value: key,
    label: key,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Send Email Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Quotes Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">
                Sending to {selectedQuotes.length} recipient{selectedQuotes.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quotes.map((quote) => (
                <Badge key={quote.id} variant="secondary" className="text-xs">
                  {quote.leadName} - {quote.insuranceType}
                </Badge>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select email template..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {templateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} Template
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview Toggle */}
          {selectedTemplate && quotes.length > 0 && (
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Email Preview (for {quotes[0].leadName})
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          )}

          {/* Email Preview */}
          {showPreview && selectedTemplate && quotes.length > 0 && (
            <div className="border rounded-lg p-4 bg-white max-h-[300px] overflow-y-auto">
              <div className="text-sm text-gray-600 mb-2">
                Subject: {emailTemplates[selectedTemplate as keyof typeof emailTemplates]?.subject
                  .replace('{{quoteid}}', quotes[0].quoteId)}
              </div>
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: getPreviewHtml(quotes[0]) }}
              />
            </div>
          )}

          {/* Email Configuration */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Email Configuration</div>
              <div className="text-blue-700">
                • Provider: SendGrid (configured)
                • From: noreply@ambainsurance.com
                • Reply-to: {quotes[0]?.agentName.toLowerCase().replace(' ', '.')}@ambainsurance.com
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSendDialog;
