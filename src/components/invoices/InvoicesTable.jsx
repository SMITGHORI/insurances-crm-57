
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  ArrowUpDown,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  Link,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { formatInvoiceDateForDisplay, getStatusBadgeClass } from '@/utils/invoiceUtils';
import { formatCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, useDeleteInvoice } from '@/hooks/useInvoices';

const InvoicesTable = ({ filterParams, sortConfig, handleSort }) => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, invoiceId: null });

  // Prepare query parameters for API call
  const queryParams = {
    status: filterParams?.status,
    clientId: filterParams?.clientId,
    agentId: filterParams?.agentId,
    policyType: filterParams?.policyType,
    startDate: filterParams?.dateRange?.start,
    endDate: filterParams?.dateRange?.end,
    sortBy: sortConfig?.key,
    sortOrder: sortConfig?.direction,
    page: 1,
    limit: 50
  };

  // Use React Query to fetch invoices
  const { data: invoicesData, isLoading, error } = useInvoices(queryParams);
  const deleteInvoiceMutation = useDeleteInvoice();

  // Extract invoices from API response
  const invoices = invoicesData?.invoices || [];

  // Apply client-side filtering for additional compatibility
  const filteredInvoices = invoices.filter(invoice => {
    // Apply status filter
    if (filterParams?.status !== 'all' && invoice.status !== filterParams.status) {
      return false;
    }
    
    // Apply client filter
    if (filterParams?.clientId !== 'all' && invoice.clientId !== filterParams.clientId) {
      return false;
    }

    // Apply agent filter
    if (filterParams?.agentId !== 'all' && invoice.agentId !== filterParams.agentId) {
      return false;
    }

    // Apply policy type filter
    if (filterParams?.policyType !== 'all' && invoice.insuranceType !== filterParams.policyType) {
      return false;
    }

    // Apply date range filter
    if (filterParams?.dateRange !== 'all' && typeof filterParams.dateRange === 'object') {
      const invoiceDate = new Date(invoice.issueDate);
      const startDate = new Date(filterParams.dateRange.start);
      const endDate = new Date(filterParams.dateRange.end);
      
      if (invoiceDate < startDate || invoiceDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Sort the filtered invoices if needed (mainly for offline mode)
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig?.key) return 0;
    
    const { key, direction } = sortConfig;
    let aValue, bValue;
    
    switch (key) {
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'issueDate':
        aValue = new Date(a.issueDate);
        bValue = new Date(b.issueDate);
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'clientName':
        aValue = a.clientName.toLowerCase();
        bValue = b.clientName.toLowerCase();
        break;
      case 'invoiceNumber':
        aValue = a.invoiceNumber.toLowerCase();
        bValue = b.invoiceNumber.toLowerCase();
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
  
  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Client Name',
      'Policy Number',
      'Issue Date',
      'Due Date',
      'Amount',
      'Status',
      'Agent'
    ];
    
    const csvRows = [
      headers.join(','),
      ...sortedInvoices.map(invoice => {
        return [
          invoice.invoiceNumber,
          `"${invoice.clientName}"`,
          invoice.policyNumber || '',
          formatInvoiceDateForDisplay(invoice.issueDate),
          formatInvoiceDateForDisplay(invoice.dueDate),
          invoice.total,
          invoice.status,
          invoice.agentName || ''
        ].join(',');
      })
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${sortedInvoices.length} invoices to CSV`);
  };

  const handleViewInvoice = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handleEditInvoice = (e, id) => {
    e.stopPropagation();
    if (!isSuperAdmin()) {
      toast.error("You don't have permission to edit invoices");
      return;
    }
    navigate(`/invoices/edit/${id}`);
  };

  const handleDeleteInvoice = async (id) => {
    if (!isSuperAdmin()) {
      toast.error("You don't have permission to delete invoices");
      return;
    }
    
    try {
      await deleteInvoiceMutation.mutateAsync(id);
      setDeleteConfirm({ isOpen: false, invoiceId: null });
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleViewClient = (e, clientId) => {
    e.stopPropagation();
    navigate(`/clients/${clientId}`);
  };

  const handleViewPolicy = (e, policyId) => {
    e.stopPropagation();
    navigate(`/policies/${policyId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading invoices: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="flex items-center"
          disabled={sortedInvoices.length === 0}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                <div className="flex items-center">
                  Invoice Number <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('issueDate')}>
                <div className="flex items-center">
                  Issue Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dueDate')}>
                <div className="flex items-center">
                  Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('total')}>
                <div className="flex items-center">
                  Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.length > 0 ? (
              sortedInvoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewInvoice(invoice.id)}
                >
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div 
                      className="flex items-center text-primary hover:underline cursor-pointer"
                      onClick={(e) => handleViewClient(e, invoice.clientId)}
                    >
                      <User className="h-4 w-4 mr-1" />
                      {invoice.clientName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.policyNumber ? (
                      <div className="flex items-center">
                        <Link 
                          className="h-4 w-4 mr-1 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPolicy(e, invoice.policyId);
                          }}
                        />
                        {invoice.policyNumber}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatInvoiceDateForDisplay(invoice.issueDate)}</TableCell>
                  <TableCell>{formatInvoiceDateForDisplay(invoice.dueDate)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.agentName ? (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {invoice.agentName}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice.id);
                          }}
                          className="cursor-pointer"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {isSuperAdmin() && (
                          <>
                            <DropdownMenuItem 
                              onClick={(e) => handleEditInvoice(e, invoice.id)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ isOpen: true, invoiceId: invoice.id });
                              }}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No invoices found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={isOpen => setDeleteConfirm({...deleteConfirm, isOpen})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteInvoice(deleteConfirm.invoiceId)}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteInvoiceMutation.isLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoicesTable;
