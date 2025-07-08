
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Upload, Send, MessageSquare, Mail, MoreHorizontal, Download, Eye } from 'lucide-react';
import { useQuotes, useBulkUpdateQuotes, useSendWhatsApp, useSendEmail } from '@/hooks/useQuotes';
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
import QuotesFilters from './QuotesFilters';
import WhatsAppSendDialog from './WhatsAppSendDialog';
import EmailSendDialog from './EmailSendDialog';
import QuoteUploadDialog from './QuoteUploadDialog';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';
import { toast } from 'sonner';

const QuotesDashboard: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState({
    status: 'all',
    branch: 'all',
    agentId: 'all',
    search: '',
  });
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: quotes = [], isLoading, error } = useQuotes(filters);
  const bulkUpdateMutation = useBulkUpdateQuotes();
  const sendWhatsAppMutation = useSendWhatsApp();
  const sendEmailMutation = useSendEmail();

  const activeFiltersCount = Object.values(filters).filter(
    (value, index) => value !== 'all' && (index !== 3 || value !== '')
  ).length;

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      branch: 'all',
      agentId: 'all',
      search: '',
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuotes(quotes.map(q => q.id));
    } else {
      setSelectedQuotes([]);
    }
  };

  const handleSelectQuote = (quoteId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuotes([...selectedQuotes, quoteId]);
    } else {
      setSelectedQuotes(selectedQuotes.filter(id => id !== quoteId));
    }
  };

  const handleBulkStatusUpdate = (status: Quote['status']) => {
    if (selectedQuotes.length === 0) {
      toast.error('Please select quotes to update');
      return;
    }
    bulkUpdateMutation.mutate({ quoteIds: selectedQuotes, status });
    setSelectedQuotes([]);
  };

  const getStatusBadge = (status: Quote['status']) => {
    const variants = {
      draft: 'secondary',
      ready: 'outline',
      sent: 'default',
      viewed: 'default',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'secondary',
    } as const;

    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      ready: 'bg-blue-100 text-blue-800',
      sent: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error loading quotes. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes Dashboard</h1>
          <p className="text-gray-600">Manage and track all quotations</p>
        </div>
        <div className="flex gap-2">
          <Protected module="quotations" action="create">
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Quote
            </Button>
          </Protected>
        </div>
      </div>

      {/* Filters */}
      <QuotesFilters
        filters={filters}
        onFiltersChange={setFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {selectedQuotes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedQuotes.length} quote{selectedQuotes.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Protected module="quotations" action="edit">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate('sent')}
                  >
                    Mark as Sent
                  </Button>
                </Protected>
                <Protected module="quotations" action="send_whatsapp">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowWhatsAppDialog(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </Protected>
                <Protected module="quotations" action="send_email">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEmailDialog(true)}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </Protected>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotes ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedQuotes.length === quotes.length && quotes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuotes.includes(quote.id)}
                        onCheckedChange={(checked) => handleSelectQuote(quote.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{quote.quoteId}</TableCell>
                    <TableCell>{quote.leadName}</TableCell>
                    <TableCell>{quote.carrier}</TableCell>
                    <TableCell>{formatCurrency(quote.premium)}</TableCell>
                    <TableCell>{formatCurrency(quote.coverageAmount)}</TableCell>
                    <TableCell>{formatDate(quote.validityEnd)}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>
                      <Protected module="quotations" action="view_commission" fallback="---">
                        {quote.commissionAmount ? formatCurrency(quote.commissionAmount) : '---'}
                      </Protected>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <Protected module="quotations" action="send_whatsapp">
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send WhatsApp
                            </DropdownMenuItem>
                          </Protected>
                          <Protected module="quotations" action="send_email">
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </Protected>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <WhatsAppSendDialog
        open={showWhatsAppDialog}
        onClose={() => setShowWhatsAppDialog(false)}
        selectedQuotes={selectedQuotes}
        quotes={quotes.filter(q => selectedQuotes.includes(q.id))}
        onSend={(message) => {
          sendWhatsAppMutation.mutate({ quoteIds: selectedQuotes, message });
          setShowWhatsAppDialog(false);
          setSelectedQuotes([]);
        }}
      />

      <EmailSendDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        selectedQuotes={selectedQuotes}
        quotes={quotes.filter(q => selectedQuotes.includes(q.id))}
        onSend={(template) => {
          sendEmailMutation.mutate({ quoteIds: selectedQuotes, template });
          setShowEmailDialog(false);
          setSelectedQuotes([]);
        }}
      />

      <QuoteUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </div>
  );
};

export default QuotesDashboard;
