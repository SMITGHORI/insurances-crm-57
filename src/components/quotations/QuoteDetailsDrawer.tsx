
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, FileText, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';
import { useQuoteById, useUpdateQuoteStatus } from '@/hooks/useQuotes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface QuoteDetailsDrawerProps {
  quoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onQuoteUpdate: () => void;
}

const QuoteDetailsDrawer: React.FC<QuoteDetailsDrawerProps> = ({
  quoteId,
  isOpen,
  onClose,
  onQuoteUpdate,
}) => {
  const { hasPermission } = usePermissions();
  const { data: quote, loading, error } = useQuoteById(quoteId);
  const updateQuoteStatusMutation = useUpdateQuoteStatus();

  const handleAcceptQuote = async () => {
    if (!quote) return;
    
    try {
      await updateQuoteStatusMutation.mutateAsync({
        quoteId: quote.id,
        status: 'approved',
      });
      toast.success('Quote accepted successfully');
      onQuoteUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to accept quote:', error);
      toast.error('Failed to accept quote');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      active: 'text-blue-600 bg-blue-100',
      approved: 'text-green-600 bg-green-100',
      expired: 'text-red-600 bg-red-100',
      rejected: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const calculateValueScore = (coverage: number, premium: number) => {
    if (premium === 0) return 0;
    return Math.round((coverage / premium) * 100) / 100;
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quote Details</SheetTitle>
          <SheetDescription>
            Complete information and actions for this quote
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-red-600">
            Error loading quote details: {error.message}
          </div>
        )}

        {quote && (
          <div className="mt-6 space-y-6">
            {/* Quote Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quote.carrier}</CardTitle>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Premium</div>
                    <div className="text-lg font-semibold">{formatCurrency(quote.premium)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Coverage</div>
                    <div className="text-lg font-semibold">{formatCurrency(quote.coverageAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Value Score</div>
                    <div className="text-lg font-semibold">
                      {quote.valueScore || calculateValueScore(quote.coverageAmount, quote.premium)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Valid Until</div>
                    <div className="text-lg font-semibold">
                      {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {quote.riskProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quote.riskProfile.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span>{quote.riskProfile.age}</span>
                      </div>
                    )}
                    {quote.riskProfile.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{quote.riskProfile.location}</span>
                      </div>
                    )}
                    {quote.riskProfile.vehicleType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle Type:</span>
                        <span>{quote.riskProfile.vehicleType}</span>
                      </div>
                    )}
                    {quote.riskProfile.healthStatus && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health Status:</span>
                        <span>{quote.riskProfile.healthStatus}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparison Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost per $1000 Coverage:</span>
                    <span className="font-mono">
                      ${((quote.premium / quote.coverageAmount) * 1000).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Days Until Expiry:</span>
                    <span className="font-mono">
                      {Math.max(0, Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {quote.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{quote.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Quote Created</div>
                      <div className="text-xs text-gray-600">
                        {format(new Date(quote.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium">Last Updated</div>
                        <div className="text-xs text-gray-600">
                          {format(new Date(quote.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  )}
                  {quote.approvedAt && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Quote Approved</div>
                        <div className="text-xs text-gray-600">
                          {format(new Date(quote.approvedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {quote.documentUrl && (
                <Protected module="quotations" action="view_document">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={quote.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Quote Document
                    </a>
                  </Button>
                </Protected>
              )}

              {quote.status === 'active' && (
                <Protected module="quotations" action="approve">
                  <Button
                    onClick={handleAcceptQuote}
                    disabled={updateQuoteStatusMutation.isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {updateQuoteStatusMutation.isLoading ? 'Processing...' : 'Accept Quote'}
                  </Button>
                </Protected>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default QuoteDetailsDrawer;
