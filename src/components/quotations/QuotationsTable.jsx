
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, EyeIcon, CheckCircle, XCircle, Clock, ArrowUpDown, Download, Edit } from 'lucide-react';
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
import { useQuotations, useSendQuotation } from '@/hooks/useQuotations';

const QuotationsTable = ({ filterParams, sortConfig, handleSort, handleExport }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Prepare query parameters for API call
  const queryParams = {
    status: filterParams?.status,
    insuranceType: filterParams?.insuranceType,
    agentId: filterParams?.agentId,
    search: filterParams?.searchTerm,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
    page: 1,
    limit: 50
  };

  // Use React Query to fetch quotations
  const { data: quotationsData, isLoading, error } = useQuotations(queryParams);
  const sendQuotationMutation = useSendQuotation();

  // Extract quotations from API response
  const quotations = quotationsData?.quotations || [];

  // Apply client-side filtering for additional compatibility
  const filteredQuotations = quotations.filter(quote => {
    // Apply status filter
    if (filterParams?.status !== 'all' && quote.status !== filterParams.status) {
      return false;
    }
    
    // Apply insurance type filter
    if (filterParams?.insuranceType !== 'all' && 
        !quote.insuranceType.toLowerCase().includes(filterParams.insuranceType.toLowerCase())) {
      return false;
    }

    // Apply agent filter
    if (filterParams?.agentId !== 'all' && quote.agentId !== filterParams.agentId) {
      return false;
    }

    // Apply search term filter
    if (filterParams?.searchTerm && 
        !quote.quoteId.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) &&
        !quote.clientName.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) &&
        !quote.clientId.toLowerCase().includes(filterParams.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sort the filtered quotations if needed (mainly for offline mode)
  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    if (!sortConfig?.key) return 0;
    
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
    console.log('Navigating to quotation detail:', id);
    navigate(`/quotations/${id}`);
  };

  const handleEditQuotation = (e, quoteId) => {
    e.stopPropagation();
    console.log('Navigating to edit quotation:', quoteId);
    navigate(`/quotations/edit/${quoteId}`);
  };

  const handleSendQuote = async (e, quoteId) => {
    e.stopPropagation();
    try {
      await sendQuotationMutation.mutateAsync({ quotationId: quoteId });
    } catch (error) {
      console.error('Error sending quotation:', error);
    }
  };

  const handleCopyQuoteId = (e, quoteId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(quoteId);
    toast.success("Quote ID copied to clipboard");
  };
  
  const renderSortIcon = (fieldName) => {
    if (sortConfig?.key === fieldName) {
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

  // Check if quotation can be edited (only draft and sent status)
  const canEditQuotation = (status) => {
    return ['draft', 'sent'].includes(status);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading quotations: {error.message}</p>
        </div>
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
                          onClick={(e) => handleSendQuote(e, quote.id)}
                          disabled={sendQuotationMutation.isLoading}
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
                      {canEditQuotation(quote.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleEditQuotation(e, quote.id)}
                          title="Edit Quote"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit size={14} />
                        </Button>
                      )}
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
