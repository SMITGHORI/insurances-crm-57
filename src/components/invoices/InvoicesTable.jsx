import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Eye, Edit, Trash2, FileText, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import InvoicesMobileView from './InvoicesMobileView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useInvoices, useDeleteInvoice } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { TableSkeleton, CardSkeleton } from '@/components/ui/professional-skeleton';

const InvoicesTable = ({ filterParams, sortConfig, handleSort, handleExport }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use the new React Query hook
  const { 
    data: invoicesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useInvoices({
    ...filterParams,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
    page: currentPage,
    limit: itemsPerPage
  });

  const deleteInvoiceMutation = useDeleteInvoice();

  // Handle loading state with professional skeleton
  if (isLoading) {
    return isMobile ? <CardSkeleton /> : <TableSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load invoices: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const invoices = invoicesResponse?.data || [];
  const totalItems = invoicesResponse?.total || 0;
  const totalPages = invoicesResponse?.totalPages || 1;

  // Get appropriate status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sent</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const handleView = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEdit = (invoiceId) => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  const handleDelete = async (invoiceId) => {
    try {
      await deleteInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSortTable = (key) => {
    handleSort(key);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render mobile view
  if (isMobile) {
    return (
      <InvoicesMobileView 
        invoices={invoices} 
        filterParams={filterParams}
        handleExport={() => handleExport(invoices)}
      />
    );
  }

  // Desktop view
  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button variant="ghost" onClick={() => handleSortTable('invoiceNumber')}>
                      Invoice Number
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button variant="ghost" onClick={() => handleSortTable('clientName')}>
                      Client
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button variant="ghost" onClick={() => handleSortTable('createdDate')}>
                      Date
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button variant="ghost" onClick={() => handleSortTable('dueDate')}>
                      Due Date
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button variant="ghost" onClick={() => handleSortTable('amount')}>
                      Amount
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-700">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.clientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.createdDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(invoice._id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(invoice._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(invoice._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No invoices match your current search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Export button for desktop */}
      <div className="flex justify-end">
        <Button
          onClick={() => handleExport(invoices)}
          variant="outline"
          className="inline-flex items-center"
        >
          <Download className="h-4 w-4 mr-1" />
          Export Invoices
        </Button>
      </div>
    </div>
  );
};

export default InvoicesTable;
