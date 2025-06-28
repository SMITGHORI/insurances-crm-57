
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { usePermissions } from '@/hooks/usePermissions';
import Protected from '@/components/Protected';

interface Quote {
  id: string;
  carrier: string;
  validUntil: string;
  status: string;
  premium: number;
}

interface QuoteReminderBannerProps {
  quotes: Quote[];
}

const QuoteReminderBanner: React.FC<QuoteReminderBannerProps> = ({ quotes }) => {
  const { hasPermission } = usePermissions();
  const [dismissed, setDismissed] = React.useState(false);

  // Filter for expiring quotes (within 7 days)
  const expiringQuotes = quotes.filter(quote => {
    if (quote.status !== 'active') return false;
    
    const validUntil = new Date(quote.validUntil);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

  // Filter for expired quotes
  const expiredQuotes = quotes.filter(quote => {
    if (quote.status !== 'active') return false;
    return new Date(quote.validUntil) < new Date();
  });

  const totalReminders = expiringQuotes.length + expiredQuotes.length;

  if (totalReminders === 0 || dismissed) {
    return null;
  }

  return (
    <Protected module="quotations" action="view">
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <AlertDescription className="text-orange-800">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Quote Reminders</span>
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  {totalReminders} total
                </Badge>
              </div>
              
              {expiredQuotes.length > 0 && (
                <div className="mb-2">
                  <span className="text-red-700 font-medium">
                    {expiredQuotes.length} expired quote{expiredQuotes.length !== 1 ? 's' : ''}:
                  </span>
                  <div className="mt-1 space-y-1">
                    {expiredQuotes.slice(0, 3).map(quote => (
                      <div key={quote.id} className="text-sm">
                        • {quote.carrier} - Expired {formatDistanceToNow(new Date(quote.validUntil))} ago
                      </div>
                    ))}
                    {expiredQuotes.length > 3 && (
                      <div className="text-sm text-red-600">
                        ...and {expiredQuotes.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {expiringQuotes.length > 0 && (
                <div>
                  <span className="text-orange-700 font-medium">
                    {expiringQuotes.length} expiring soon:
                  </span>
                  <div className="mt-1 space-y-1">
                    {expiringQuotes.slice(0, 3).map(quote => {
                      const daysLeft = Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={quote.id} className="text-sm">
                          • {quote.carrier} - Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </div>
                      );
                    })}
                    {expiringQuotes.length > 3 && (
                      <div className="text-sm text-orange-600">
                        ...and {expiringQuotes.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AlertDescription>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {hasPermission('quotations', 'manage') && (
              <Button
                size="sm"
                variant="outline"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Review All
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-orange-600 hover:bg-orange-100 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>
    </Protected>
  );
};

export default QuoteReminderBanner;
