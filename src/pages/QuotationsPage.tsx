
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuoteForm from '@/components/quotations/QuoteForm';
import QuoteComparisonTable from '@/components/quotations/QuoteComparisonTable';
import QuoteDetailsDrawer from '@/components/quotations/QuoteDetailsDrawer';
import QuoteReminderBanner from '@/components/quotations/QuoteReminderBanner';
import ClientQuotePortal from '@/components/quotations/ClientQuotePortal';
import { useQuotes } from '@/hooks/useQuotes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const QuotationsPage: React.FC = () => {
  const { leadId, quotationId } = useParams<{ leadId?: string; quotationId?: string }>();
  const { hasPermission } = usePermissions();
  
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(quotationId || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(!!quotationId);
  const [activeTab, setActiveTab] = useState('quotes');

  console.log('QuotationsPage - Params:', { leadId, quotationId });
  console.log('QuotationsPage - Initial state:', { selectedQuoteId, isDrawerOpen });

  // Determine search parameter - if we have quotationId, search by that, otherwise use leadId
  const searchParam = quotationId || leadId || '';

  console.log('QuotationsPage - Search param:', searchParam);

  // Add error boundary for the quotes hook
  let quotes = [];
  let loading = false;
  let error = null;
  let refreshQuotes = () => {};

  try {
    const quotesResult = useQuotes({ search: searchParam });
    quotes = quotesResult.data || [];
    loading = quotesResult.isLoading;
    error = quotesResult.error;
    refreshQuotes = quotesResult.refetch;
    
    console.log('QuotationsPage - Quotes result:', { quotes: quotes.length, loading, error });
  } catch (err) {
    console.error('Error in useQuotes hook:', err);
    error = err;
  }

  // Update selectedQuoteId and drawer state when quotationId changes
  useEffect(() => {
    if (quotationId) {
      console.log('QuotationsPage - Setting selected quote from URL:', quotationId);
      setSelectedQuoteId(quotationId);
      setIsDrawerOpen(true);
    }
  }, [quotationId]);

  const handleQuoteSelect = (quoteId: string) => {
    console.log('QuotationsPage - Quote selected:', quoteId);
    setSelectedQuoteId(quoteId);
    setIsDrawerOpen(true);
  };

  const handleQuoteCreated = () => {
    refreshQuotes();
    toast.success('Quote created successfully');
  };

  if (loading) {
    console.log('QuotationsPage - Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading quotations...</span>
      </div>
    );
  }

  if (error) {
    console.error('QuotationsPage - Error state:', error);
    return (
      <Card className="mx-4">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error loading quotes: {error?.message || 'Unknown error occurred'}
            <br />
            <small>Search param: {searchParam}</small>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we have a quotationId but no quotes found, show appropriate message
  if (quotationId && quotes.length === 0 && !loading) {
    console.log('QuotationsPage - No quotes found for quotationId:', quotationId);
    return (
      <Card className="mx-4">
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            Quote not found or you don't have permission to view it.
            <br />
            <small>Looking for quotation ID: {quotationId}</small>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pageTitle = quotationId ? 'Quote Details' : 'Lead Quotations';
  const pageDescription = quotationId 
    ? `Managing quote ${quotationId}` 
    : `Manage quotes for Lead #${leadId}`;

  console.log('QuotationsPage - Rendering with:', { 
    pageTitle, 
    quotesCount: quotes.length, 
    selectedQuoteId, 
    isDrawerOpen 
  });

  return (
    <ProtectedRoute module="quotations" action="view">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Lead/Quote Info */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">{pageDescription}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {quotes.length} Quote{quotes.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Expiring Quotes Banner */}
        <QuoteReminderBanner quotes={quotes} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quotes">Active Quotes</TabsTrigger>
            <TabsTrigger value="create">Create Quote</TabsTrigger>
            {hasPermission('quotations', 'public_view') && (
              <TabsTrigger value="client-portal">Client Portal</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            <QuoteComparisonTable
              quotes={quotes}
              onQuoteSelect={handleQuoteSelect}
              onQuoteUpdate={refreshQuotes}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <QuoteForm
                  leadId={leadId || ''}
                  onQuoteCreated={handleQuoteCreated}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {hasPermission('quotations', 'public_view') && (
            <TabsContent value="client-portal" className="space-y-4">
              <ClientQuotePortal
                leadId={leadId || ''}
                quotes={quotes.filter(q => q.status === 'sent')}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Quote Details Drawer */}
        <QuoteDetailsDrawer
          quoteId={selectedQuoteId}
          isOpen={isDrawerOpen}
          onClose={() => {
            console.log('QuotationsPage - Closing drawer');
            setIsDrawerOpen(false);
          }}
          onQuoteUpdate={refreshQuotes}
        />
      </div>
    </ProtectedRoute>
  );
};

export default QuotationsPage;
