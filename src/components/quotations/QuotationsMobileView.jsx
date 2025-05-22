
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Copy, Send, EyeIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const QuotationsMobileView = ({ quotations }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sent</Badge>;
      case 'viewed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Viewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSendQuote = (e, id) => {
    e.stopPropagation();
    toast.success(`Quotation ${id} sent to client successfully`);
  };

  const handleCopyQuoteId = (e, quoteId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(quoteId);
    toast.success("Quote ID copied to clipboard");
  };

  const getActionButton = (quote) => {
    switch (quote.status) {
      case 'draft':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => handleSendQuote(e, quote.quoteId)}
            title="Send Quote"
            className="w-full"
          >
            <Send size={14} className="mr-2" /> Send Quote
          </Button>
        );
      case 'sent':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full"
          >
            <Clock size={14} className="mr-2" /> Awaiting View
          </Button>
        );
      case 'viewed':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full"
          >
            <EyeIcon size={14} className="mr-2" /> Viewed by Client
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50 w-full"
          >
            <CheckCircle size={14} className="mr-2" /> Accepted
          </Button>
        );
      case 'rejected':
        return (
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 w-full"
          >
            <XCircle size={14} className="mr-2" /> Rejected
          </Button>
        );
      default:
        return null;
    }
  };

  if (quotations.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center text-gray-500">
          No quotations found matching your filters
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {quotations.map((quote) => (
        <Card 
          key={quote.id} 
          className="overflow-hidden animate-fade-in hover:shadow-md transition-shadow"
          onClick={() => navigate(`/quotations/${quote.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-700">{quote.quoteId}</span>
                <button
                  onClick={(e) => handleCopyQuoteId(e, quote.quoteId)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy Quote ID"
                >
                  <Copy size={14} />
                </button>
              </div>
              {getStatusBadge(quote.status)}
            </div>
            
            <div className="mb-3">
              <div className="font-medium">{quote.clientName}</div>
              <div className="text-sm text-gray-500">{quote.clientId}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="text-sm">{quote.insuranceType}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Insurer</div>
                <div className="text-sm">{quote.insuranceCompany}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Premium</div>
                <div className="text-sm font-medium">{formatCurrency(quote.premium)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Valid Until</div>
                <div className="text-sm">{quote.validUntil}</div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              {getActionButton(quote)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuotationsMobileView;
