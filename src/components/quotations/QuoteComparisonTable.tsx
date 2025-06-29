
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, CheckCircle, MoreHorizontal, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';
import ProtectedRow from '@/components/ProtectedRow';
import { useUpdateQuoteStatus, useExportQuotes } from '@/hooks/useQuotes';
import { toast } from 'sonner';

interface Quote {
  id: string;
  carrier: string;
  premium: number;
  coverageAmount: number;
  valueScore: number;
  validUntil: string;
  status: 'draft' | 'active' | 'approved' | 'expired' | 'rejected';
  documentUrl?: string;
  branch: string;
  createdAt: string;
  notes?: string;
}

interface QuoteComparisonTableProps {
  quotes: Quote[];
  onQuoteSelect: (quoteId: string) => void;
  onQuoteUpdate: () => void;
}

const QuoteComparisonTable: React.FC<QuoteComparisonTableProps> = ({
  quotes,
  onQuoteSelect,
  onQuoteUpdate,
}) => {
  const { hasPermission, isSameBranch } = usePermissions();
  const [exportingQuotes, setExportingQuotes] = useState(false);
  const updateQuoteStatusMutation = useUpdateQuoteStatus();
  const exportQuotesMutation = useExportQuotes();

  const getStatusBadgeVariant = (status: Quote['status']) => {
    const variants = {
      draft: 'secondary' as const,
      ready: 'outline' as const,
      sent: 'default' as const,
      viewed: 'default' as const,
      accepted: 'default' as const,
      rejected: 'destructive' as const,
      expired: 'secondary' as const,
    };
    return variants[status] || 'secondary';
  };

  const getStatusColor = (status: Quote['status']) => {
    const colors = {
      draft: 'text-gray-600',
      active: 'text-blue-600',
      approved: 'text-green-600',
      expired: 'text-red-600',
      rejected: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const handleApproveQuote = async (quoteId: string) => {
    try {
      await updateQuoteStatusMutation.mutateAsync({
        quoteId,
        status: 'accepted', // Changed from 'approved' to 'accepted'
      });
      toast.success('Quote approved successfully');
      onQuoteUpdate();
    } catch (error) {
      console.error('Failed to approve quote:', error);
      toast.error('Failed to approve quote');
    }
  };

  const handleExportQuotes = async () => {
    try {
      setExportingQuotes(true);
      const visibleQuotes = quotes.filter(quote => 
        hasPermission('quotations', 'view') && isSameBranch(quote.branch)
      );
      
      await exportQuotesMutation.mutateAsync(visibleQuotes);
      toast.success(`Exported ${visibleQuotes.length} quotes to CSV`);
    } catch (error) {
      console.error('Failed to export quotes:', error);
      toast.error('Failed to export quotes');
    } finally {
      setExportingQuotes(false);
    }
  };

  const calculateValueScore = (coverage: number, premium: number) => {
    if (premium === 0) return 0;
    return Math.round((coverage / premium) * 100) / 100;
  };

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No quotes available</h3>
            <p className="mt-2 text-gray-600">
              Create your first quote to see the comparison table.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quote Comparison</CardTitle>
          <Protected module="quotations" action="export">
            <Button
              variant="outline"
              onClick={handleExportQuotes}
              disabled={exportingQuotes}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {exportingQuotes ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Protected>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead className="text-right">Premium</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
                <TableHead className="text-right">Value Score</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <ProtectedRow
                  key={quote.id}
                  recordBranch={quote.branch}
                  module="quotations"
                  branchCheck={true}
                >
                  <TableRow className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{quote.carrier}</div>
                        <div className="text-sm text-gray-500">
                          Created {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(quote.premium)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(quote.coverageAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {quote.valueScore || calculateValueScore(quote.coverageAmount, quote.premium)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                        {new Date(quote.validUntil) < new Date() && (
                          <div className="text-red-500 text-xs">Expired</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(quote.status)}
                        className={getStatusColor(quote.status)}
                      >
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white z-50">
                          <DropdownMenuItem
                            onClick={() => onQuoteSelect(quote.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {quote.documentUrl && (
                            <Protected module="quotations" action="view_document">
                              <DropdownMenuItem asChild>
                                <a 
                                  href={quote.documentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="cursor-pointer flex items-center"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Document
                                </a>
                              </DropdownMenuItem>
                            </Protected>
                          )}
                          
                          {quote.status === 'active' && (
                            <Protected module="quotations" action="approve">
                              <DropdownMenuItem
                                onClick={() => handleApproveQuote(quote.id)}
                                className="cursor-pointer text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Quote
                              </DropdownMenuItem>
                            </Protected>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </ProtectedRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteComparisonTable;
