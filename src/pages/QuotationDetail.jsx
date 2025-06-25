
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuotationDetailTabs from '@/components/quotations/QuotationDetailTabs';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock quotation data - in real app, this would come from an API call
  const quotation = {
    id: id,
    quoteId: 'QT-2025-0001',
    clientId: '674a1234567890abcdef1001',
    clientName: 'John Doe',
    clientEmail: 'john.doe@email.com',
    clientPhone: '+91-9876543210',
    insuranceType: 'Health Insurance',
    insuranceCompany: 'Star Health',
    products: [
      {
        name: 'Family Floater Plan',
        description: 'Comprehensive health coverage for family',
        sumInsured: 500000,
        premium: 25000
      }
    ],
    sumInsured: 500000,
    premium: 25000,
    agentId: '674a1234567890abcdef2001',
    agentName: 'Agent Smith',
    status: 'sent',
    validUntil: '2025-07-01',
    createdDate: '2025-06-01',
    sentDate: '2025-06-02',
    notes: 'Initial quotation for family health insurance',
    attachments: [],
    customFields: {}
  };

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
