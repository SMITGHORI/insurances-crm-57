
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, EyeIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import QuotationsMobileView from './QuotationsMobileView';

const QuotationsTable = ({ filterParams }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Sample data - in a real app, this would be fetched from an API based on filterParams
  const quotations = [
    {
      id: 1,
      quoteId: 'QT-2025-0001',
      clientName: 'Vivek Patel',
      clientId: 'CLI-2025-0001',
      insuranceType: 'Health Insurance',
      insuranceCompany: 'Star Health',
      products: ['Family Floater Plan', 'Critical Illness Add-on'],
      sumInsured: 500000,
      premium: 25000,
      agentName: 'Rajiv Kumar',
      agentId: 'agent1',
      createdDate: '18 May 2025',
      validUntil: '18 Jun 2025',
      status: 'draft',
      emailSent: false,
      viewedAt: null,
      notes: 'Client requested quotes for family of 4 with pre-existing conditions'
    },
    {
      id: 2,
      quoteId: 'QT-2025-0002',
      clientName: 'Priya Desai',
      clientId: 'CLI-2025-0012',
      insuranceType: 'Term Insurance',
      insuranceCompany: 'HDFC Life',
      products: ['Click 2 Protect Life', 'Critical Illness Rider'],
      sumInsured: 10000000,
      premium: 15000,
      agentName: 'Neha Sharma',
      agentId: 'agent4',
      createdDate: '15 May 2025',
      validUntil: '15 Jun 2025',
      status: 'sent',
      emailSent: true,
      sentDate: '15 May 2025',
      viewedAt: null,
      notes: 'Client is a non-smoker with no medical history'
    },
    {
      id: 3,
      quoteId: 'QT-2025-0003',
      clientName: 'Tech Solutions Ltd',
      clientId: 'CLI-2025-0024',
      insuranceType: 'Group Health Insurance',
      insuranceCompany: 'ICICI Lombard',
      products: ['Group Mediclaim Policy'],
      sumInsured: 2000000,
      premium: 450000,
      agentName: 'Rajiv Kumar',
      agentId: 'agent1',
      createdDate: '12 May 2025',
      validUntil: '12 Jun 2025',
      status: 'viewed',
      emailSent: true,
      sentDate: '12 May 2025',
      viewedAt: '14 May 2025',
      notes: 'Company has 50 employees, looking for comprehensive coverage'
    },
    {
      id: 4,
      quoteId: 'QT-2025-0004',
      clientName: 'Arjun Singh',
      clientId: 'CLI-2025-0035',
      insuranceType: 'Motor Insurance',
      insuranceCompany: 'Bajaj Allianz',
      products: ['Comprehensive Car Insurance'],
      sumInsured: 800000,
      premium: 12000,
      agentName: 'Amir Khan',
      agentId: 'agent3',
      createdDate: '10 May 2025',
      validUntil: '10 Jun 2025',
      status: 'accepted',
      emailSent: true,
      sentDate: '10 May 2025',
      viewedAt: '11 May 2025',
      acceptedAt: '12 May 2025',
      convertedToPolicy: 'POL-2025-0412',
      notes: 'New car purchase, comprehensive coverage with zero-dep add-on'
    },
    {
      id: 5,
      quoteId: 'QT-2025-0005',
      clientName: 'Ramesh Joshi',
      clientId: 'CLI-2025-0042',
      insuranceType: 'Health Insurance',
      insuranceCompany: 'Max Bupa',
      products: ['Health Companion'],
      sumInsured: 700000,
      premium: 32000,
      agentName: 'Priya Singh',
      agentId: 'agent2',
      createdDate: '8 May 2025',
      validUntil: '8 Jun 2025',
      status: 'rejected',
      emailSent: true,
      sentDate: '8 May 2025',
      viewedAt: '9 May 2025',
      rejectedAt: '10 May 2025',
      rejectionReason: 'Premium too high',
      notes: 'Client has pre-existing conditions, diabetes and hypertension'
    },
    {
      id: 6,
      quoteId: 'QT-2025-0006',
      clientName: 'Sanjay Mehta',
      clientId: 'CLI-2025-0050',
      insuranceType: 'Travel Insurance',
      insuranceCompany: 'Tata AIG',
      products: ['Travel Guard'],
      sumInsured: 500000,
      premium: 5000,
      agentName: 'Neha Sharma',
      agentId: 'agent4',
      createdDate: '1 May 2025',
      validUntil: '1 Jun 2025',
      status: 'expired',
      emailSent: true,
      sentDate: '1 May 2025',
      viewedAt: '2 May 2025',
      notes: 'Client traveling to USA for 2 weeks'
    }
  ];

  const filteredQuotations = quotations.filter(quote => {
    // Apply status filter
    if (filterParams.status !== 'all' && quote.status !== filterParams.status) {
      return false;
    }
    
    // Apply insurance type filter
    if (filterParams.insuranceType !== 'all' && 
        !quote.insuranceType.toLowerCase().includes(filterParams.insuranceType.toLowerCase())) {
      return false;
    }

    // Apply agent filter
    if (filterParams.agentId !== 'all' && quote.agentId !== filterParams.agentId) {
      return false;
    }

    // Apply search term filter
    if (filterParams.searchTerm && 
        !quote.quoteId.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) &&
        !quote.clientName.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) &&
        !quote.clientId.toLowerCase().includes(filterParams.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

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

  const handleRowClick = (id) => {
    navigate(`/quotations/${id}`);
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

  if (isMobile) {
    return <QuotationsMobileView quotations={filteredQuotations} />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left font-semibold">Quote ID</th>
            <th className="py-3 px-4 text-left font-semibold">Client</th>
            <th className="py-3 px-4 text-left font-semibold">Type & Company</th>
            <th className="py-3 px-4 text-left font-semibold">Sum Insured</th>
            <th className="py-3 px-4 text-left font-semibold">Premium</th>
            <th className="py-3 px-4 text-left font-semibold">Created</th>
            <th className="py-3 px-4 text-left font-semibold">Valid Until</th>
            <th className="py-3 px-4 text-left font-semibold">Status</th>
            <th className="py-3 px-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuotations.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-8 text-center text-gray-500">
                No quotations found matching your filters
              </td>
            </tr>
          ) : (
            filteredQuotations.map((quote) => (
              <tr 
                key={quote.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(quote.id)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-700">{quote.quoteId}</span>
                    <button
                      onClick={(e) => handleCopyQuoteId(e, quote.quoteId)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy Quote ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{quote.clientName}</div>
                    <div className="text-sm text-gray-500">{quote.clientId}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{quote.insuranceType}</div>
                    <div className="text-sm text-gray-500">{quote.insuranceCompany}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{formatCurrency(quote.sumInsured)}</td>
                <td className="py-3 px-4">{formatCurrency(quote.premium)}</td>
                <td className="py-3 px-4">{quote.createdDate}</td>
                <td className="py-3 px-4">{quote.validUntil}</td>
                <td className="py-3 px-4">{getStatusBadge(quote.status)}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {quote.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => handleSendQuote(e, quote.quoteId)}
                        title="Send Quote"
                      >
                        <Send size={14} />
                      </Button>
                    )}
                    {(['sent', 'viewed'].includes(quote.status)) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        title="Quote viewed status"
                      >
                        {quote.status === 'viewed' ? <EyeIcon size={14} /> : <Clock size={14} />}
                      </Button>
                    )}
                    {quote.status === 'accepted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        title="Quote accepted"
                      >
                        <CheckCircle size={14} />
                      </Button>
                    )}
                    {quote.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        title="Quote rejected"
                      >
                        <XCircle size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuotationsTable;
