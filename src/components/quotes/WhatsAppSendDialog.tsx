
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';
import { Quote } from '@/__mocks__/quotes';

interface WhatsAppSendDialogProps {
  open: boolean;
  onClose: () => void;
  selectedQuotes: string[];
  quotes: Quote[];
  onSend: (message: string) => void;
}

const WhatsAppSendDialog: React.FC<WhatsAppSendDialogProps> = ({
  open,
  onClose,
  selectedQuotes,
  quotes,
  onSend,
}) => {
  const [message, setMessage] = useState(`Hi {{clientName}},

Your insurance quote is ready! 

🏥 Plan: {{planName}}
🏢 Carrier: {{carrier}}
💰 Premium: ₹{{premium}}
🛡️ Coverage: ₹{{coverage}}
📅 Valid until: {{validityEnd}}

Click here to view and accept: {{quoteLink}}

Best regards,
{{agentName}}`);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Send WhatsApp Messages
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
                  {quote.leadName} - {quote.carrier}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message Template */}
          <div>
            <label className="text-sm font-medium text-gray-700">Message Template</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your WhatsApp message..."
              className="mt-1 min-h-[200px]"
            />
            <div className="text-xs text-gray-500 mt-1">
              Available variables: {{`{clientName}, {planName}, {carrier}, {premium}, {coverage}, {validityEnd}, {agentName}, {quoteLink}`}}
            </div>
          </div>

          {/* Preview */}
          {quotes.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Preview (for {quotes[0].leadName})</label>
              <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="whitespace-pre-wrap">
                  {message
                    .replace('{{clientName}}', quotes[0].leadName)
                    .replace('{{planName}}', quotes[0].planName)
                    .replace('{{carrier}}', quotes[0].carrier)
                    .replace('{{premium}}', formatCurrency(quotes[0].premium))
                    .replace('{{coverage}}', formatCurrency(quotes[0].coverageAmount))
                    .replace('{{validityEnd}}', new Date(quotes[0].validityEnd).toLocaleDateString('en-IN'))
                    .replace('{{agentName}}', quotes[0].agentName)
                    .replace('{{quoteLink}}', `https://app.ambainsurance.com/quotes/${quotes[0].id}/accept`)}
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
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppSendDialog;
