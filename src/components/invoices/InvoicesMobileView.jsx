
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileText, User, Calendar, Link } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getStatusBadgeClass, formatInvoiceDateForDisplay } from '@/utils/invoiceUtils';

const InvoicesMobileView = ({ invoices }) => {
  const navigate = useNavigate();

  const handleViewInvoice = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handleViewClient = (e, clientId) => {
    e.stopPropagation();
    navigate(`/clients/${clientId}`);
  };

  if (invoices.length === 0) {
    return (
      <Card className="mt-4 animate-fade-in">
        <CardContent className="pt-6 text-center text-gray-500">
          No invoices found matching your criteria
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {invoices.map((invoice) => (
        <Card 
          key={invoice.id} 
          className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in"
          onClick={() => handleViewInvoice(invoice.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-blue-700">{invoice.invoiceNumber}</div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            
            <div className="mb-3">
              <div 
                className="flex items-center text-primary hover:underline cursor-pointer"
                onClick={(e) => handleViewClient(e, invoice.clientId)}
              >
                <User className="h-4 w-4 mr-1" />
                {invoice.clientName}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              {invoice.policyNumber && (
                <div>
                  <div className="text-xs text-gray-500">Policy</div>
                  <div className="text-sm flex items-center">
                    <Link className="h-3 w-3 mr-1" />
                    {invoice.policyNumber}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-sm font-semibold">{formatCurrency(invoice.total)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Issue Date</div>
                <div className="text-sm flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatInvoiceDateForDisplay(invoice.issueDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Due Date</div>
                <div className="text-sm flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatInvoiceDateForDisplay(invoice.dueDate)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewInvoice(invoice.id);
                }}
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvoicesMobileView;
