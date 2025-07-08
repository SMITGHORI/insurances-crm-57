
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuotationDetailTabs from '@/components/quotations/QuotationDetailTabs';
import { useQuotation } from '@/hooks/useQuotations';
import { toast } from 'react-hot-toast';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading, error } = useQuotation(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load quotation details');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load quotation details</p>
          <Button onClick={() => navigate('/quotations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Quotation not found</p>
          <Button onClick={() => navigate('/quotations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/quotations')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotations
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {quotation.quoteId}
        </h1>
        <p className="text-gray-600">Complete quotation information and management</p>
      </div>

      <QuotationDetailTabs quotation={quotation} />
    </div>
  );
};

export default QuotationDetail;
