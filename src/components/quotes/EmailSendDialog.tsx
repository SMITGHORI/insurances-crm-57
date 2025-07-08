
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
// Define Quote interface locally
interface Quote {
  id: string;
  quoteId: string;
  leadId: string;
  leadName: string;
  carrier: string;
  premium: number;
  coverageAmount: number;
  planName: string;
  validityStart: string;
  validityEnd: string;
  validUntil: string;
  insuranceType: 'Health Insurance' | 'Life Insurance' | 'Motor Insurance' | 'Home Insurance' | 'Travel Insurance';
  status: 'draft' | 'ready' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  agentId: string;
  agentName: string;
  branch: string;
  createdAt: string;
  updatedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  approvedAt?: string;
  notes?: string;
  documentUrl?: string;
  commissionAmount?: number;
  whatsappSent?: boolean;
  emailSent?: boolean;
  valueScore: number;
  riskProfile?: {
    age?: number;
    location?: string;
    vehicleType?: string;
    healthStatus?: string;
  };
  followUpReminders: Array<{
    type: 'email' | 'call' | 'whatsapp';
    scheduledFor: string;
    completed: boolean;
  }>;
}

// Define email templates locally
const emailTemplates = {
  'Health Insurance': {
    subject: 'Your Health Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Health Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>We're pleased to share your personalized health insurance quote:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <p>This quote is valid until {{validityEnd}}. Click below to accept:</p>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  },
  'Motor Insurance': {
    subject: 'Your Motor Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Motor Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>Here's your motor insurance quote:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  },
  'Life Insurance': {
    subject: 'Your Life Insurance Quote - {{quoteid}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Life Insurance Quote</h2>
        <p>Dear {{clientName}},</p>
        <p>Your life insurance quote is ready:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>{{planName}}</h3>
          <p><strong>Carrier:</strong> {{carrier}}</p>
          <p><strong>Premium:</strong> ₹{{premium}}</p>
          <p><strong>Coverage:</strong> ₹{{coverage}}</p>
          <p><strong>Valid Until:</strong> {{validityEnd}}</p>
        </div>
        <a href="{{acceptUrl}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Quote</a>
      </div>
    `
  }
};

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
