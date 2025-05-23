
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, EyeIcon, CheckCircle, XCircle, Clock, ArrowUpDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import QuotationsMobileView from './QuotationsMobileView';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const QuotationsTable = ({ filterParams, sortConfig, handleSort, handleExport }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Apply filters to quotations
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

  // Sort the filtered quotations
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue, bValue;
    
    switch (key) {
      case 'premium':
        aValue = a.premium;
        bValue = b.premium;
        break;
      case 'clientName':
        aValue = a.clientName.toLowerCase();
        bValue = b.clientName.toLowerCase();
        break;
      case 'insuranceType':
        aValue = a.insuranceType.toLowerCase();
        bValue = b.insuranceType.toLowerCase();
        break;
      case 'createdDate':
        // This is just for example - in real app we'd parse actual dates
        aValue = a.createdDate;
        bValue = b.createdDate;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
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
  
  const renderSortIcon = (fieldName) => {
    if (sortConfig.key === fieldName) {
      return (
        <span className={`ml-1 text-gray-400`}>
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return null;
  };
  
  const getSortableHeaderProps = (fieldName, label) => {
    return {
      onClick: () => handleSort(fieldName),
      className: "cursor-pointer hover:bg-gray-50",
      children: (
        <div className="flex items-center">
          {label}
          {renderSortIcon(fieldName)}
          {!renderSortIcon(fieldName) && (
            <ArrowUpDown size={14} className="ml-1 text-gray-300" />
          )}
        </div>
      ),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isMobile) {
    return <QuotationsMobileView quotations={sortedQuotations} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {sortedQuotations.length} of {quotations.length} quotations
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleExport(sortedQuotations)}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" /> 
          Export
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead {...getSortableHeaderProps('quoteId', 'Quote ID')} />
              <TableHead {...getSortableHeaderProps('clientName', 'Client')} />
              <TableHead {...getSortableHeaderProps('insuranceType', 'Type & Company')} />
              <TableHead>Sum Insured</TableHead>
              <TableHead {...getSortableHeaderProps('premium', 'Premium')} />
              <TableHead {...getSortableHeaderProps('createdDate', 'Created')} />
              <TableHead>Valid Until</TableHead>
              <TableHead {...getSortableHeaderProps('status', 'Status')} />
              <TableHead className="text-left font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan="9" className="py-8 text-center text-gray-500">
                  No quotations found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              sortedQuotations.map((quote) => (
                <TableRow 
                  key={quote.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(quote.id)}
                >
                  <TableCell className="py-3 px-4">
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
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div>
                      <div className="font-medium">{quote.clientName}</div>
                      <div className="text-sm text-gray-500">{quote.clientId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div>
                      <div className="font-medium">{quote.insuranceType}</div>
                      <div className="text-sm text-gray-500">{quote.insuranceCompany}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">{formatCurrency(quote.sumInsured)}</TableCell>
                  <TableCell className="py-3 px-4">{formatCurrency(quote.premium)}</TableCell>
                  <TableCell className="py-3 px-4">{quote.createdDate}</TableCell>
                  <TableCell className="py-3 px-4">{quote.validUntil}</TableCell>
                  <TableCell className="py-3 px-4">{getStatusBadge(quote.status)}</TableCell>
                  <TableCell className="py-3 px-4">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/quotations/edit/${quote.id}`);
                        }}
                        title="Edit Quote"
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuotationsTable;
