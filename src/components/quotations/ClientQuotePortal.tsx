
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, FileText, Shield, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Quote {
  id: string;
  carrier: string;
  premium: number;
  coverageAmount: number;
  valueScore: number;
  validUntil: string;
  status: string;
  features?: string[];
  recommended?: boolean;
}

interface ClientQuotePortalProps {
  leadId: string;
  quotes: Quote[];
}

const ClientQuotePortal: React.FC<ClientQuotePortalProps> = ({ leadId, quotes }) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    toast.success('Quote selected! Redirecting to purchase...');
    // In a real app, this would redirect to purchase flow
  };

  const handleSignupRedirect = () => {
    toast.info('Redirecting to signup/login...');
    // In a real app, this would redirect to auth flow
  };

  const calculateValueScore = (coverage: number, premium: number) => {
    if (premium === 0) return 0;
    return Math.round((coverage / premium) * 100) / 100;
  };

  const sortedQuotes = [...quotes]
    .sort((a, b) => {
      // Put recommended quotes first
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      // Then sort by value score
      const aScore = a.valueScore || calculateValueScore(a.coverageAmount, a.premium);
      const bScore = b.valueScore || calculateValueScore(b.coverageAmount, b.premium);
      return bScore - aScore;
    });

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No quotes available</h3>
            <p className="mt-2 text-gray-600">
              Please contact our agents to get personalized quotes for your insurance needs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Shield className="mr-2 h-5 w-5" />
            Your Personalized Insurance Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            Compare quotes from top insurance carriers and choose the plan that best fits your needs.
            All quotes are valid for a limited time.
          </p>
        </CardContent>
      </Card>

      {/* Quote Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insurance Carrier</TableHead>
                  <TableHead className="text-right">Monthly Premium</TableHead>
                  <TableHead className="text-right">Coverage Amount</TableHead>
                  <TableHead className="text-right">Value Score</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedQuotes.map((quote) => (
                  <TableRow 
                    key={quote.id}
                    className={`hover:bg-gray-50 ${quote.recommended ? 'bg-green-50 border-green-200' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-medium flex items-center">
                            {quote.carrier}
                            {quote.recommended && (
                              <Badge className="ml-2 bg-green-100 text-green-800 border-green-300">
                                <Star className="mr-1 h-3 w-3" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                          {quote.features && (
                            <div className="text-xs text-gray-500 mt-1">
                              {quote.features.slice(0, 2).join(' • ')}
                              {quote.features.length > 2 && ' • ...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(quote.premium)}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(quote.coverageAmount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`font-mono ${
                          (quote.valueScore || calculateValueScore(quote.coverageAmount, quote.premium)) > 50 
                            ? 'border-green-300 text-green-700' 
                            : 'border-gray-300'
                        }`}
                      >
                        {quote.valueScore || calculateValueScore(quote.coverageAmount, quote.premium)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        onClick={() => handleSelectQuote(quote.id)}
                        className={`${
                          quote.recommended 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        size="sm"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Select & Purchase
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* E-signature Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Ready to Purchase?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-orange-800">
              Once you select a quote, you'll be able to:
            </p>
            <ul className="list-disc list-inside text-orange-700 space-y-1">
              <li>Review complete policy terms and conditions</li>
              <li>Provide electronic signature for quick processing</li>
              <li>Set up automatic premium payments</li>
              <li>Receive instant policy confirmation</li>
            </ul>
            <div className="pt-4">
              <Button 
                onClick={handleSignupRedirect}
                variant="outline"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                Need an Account? Sign Up Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
        <p>
          * Quotes are estimates based on the information provided. Final premiums may vary based on underwriting.
          All quotes are subject to terms and conditions. Please review policy documents carefully before purchase.
        </p>
      </div>
    </div>
  );
};

export default ClientQuotePortal;
