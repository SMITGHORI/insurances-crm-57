
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import LeadDesktopView from './LeadDesktopView';
import LeadMobileView from './LeadMobileView';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { TableSkeleton, CardSkeleton } from '@/components/ui/professional-skeleton';

const LeadsTable = ({ 
  filterParams, 
  sortField, 
  sortDirection,
  handleExport: parentHandleExport
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Prepare query parameters for API call
  const queryParams = {
    status: filterParams?.status,
    source: filterParams?.source,
    assignedTo: filterParams?.assignedTo,
    priority: filterParams?.priority,
    search: filterParams?.searchTerm,
    sortBy: sortField,
    sortOrder: sortDirection,
    page: 1,
    limit: 50
  };

  // Use React Query to fetch leads
  const { data: leadsData, isLoading, error } = useLeads(queryParams);
  const deleteLeadMutation = useDeleteLead();

  // Extract leads from API response
  const leads = leadsData?.leads || [];
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Apply client-side filtering and sorting for sample data compatibility
  useEffect(() => {
    let result = [...leads];
    
    // Apply filters if needed (mainly for offline mode)
    if (filterParams) {
      // Filter by status
      if (filterParams.status !== 'all') {
        result = result.filter(lead => lead.status === filterParams.status);
      }
      
      // Filter by source
      if (filterParams.source !== 'all') {
        result = result.filter(lead => lead.source === filterParams.source);
      }
      
      // Filter by assigned agent
      if (filterParams.assignedTo !== 'all') {
        result = result.filter(lead => lead.assignedTo === filterParams.assignedTo);
      }
      
      // Filter by priority
      if (filterParams.priority !== 'all') {
        result = result.filter(lead => lead.priority === filterParams.priority);
      }
      
      // Filter by search term
      if (filterParams.searchTerm) {
        const searchLower = filterParams.searchTerm.toLowerCase();
        result = result.filter(lead => 
          lead.name.toLowerCase().includes(searchLower) || 
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchLower) ||
          lead.id.toLowerCase().includes(searchLower)
        );
      }
    }
    
    // Apply sorting if needed (mainly for offline mode)
    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        
        if (a[sortField] < b[sortField]) {
          comparison = -1;
        } else if (a[sortField] > b[sortField]) {
          comparison = 1;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    setFilteredLeads(result);
  }, [leads, filterParams, sortField, sortDirection]);

  const handleViewDetails = (id) => {
    navigate(`/leads/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/leads/edit/${id}`);
  };

  const handleDelete = (id) => {
    setLeadToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLeadMutation.mutateAsync(leadToDelete);
      setShowDeleteDialog(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleExport = () => {
    try {
      // Format lead data for export
      const exportData = filteredLeads.map(lead => ({
        'Lead ID': lead.id,
        'Name': lead.name,
        'Phone': lead.phone,
        'Email': lead.email,
        'Source': lead.source,
        'Product': lead.product,
        'Status': lead.status,
        'Created Date': lead.createdAt,
        'Assigned To': lead.assignedTo,
        'Next Follow-up': lead.nextFollowUp,
        'Last Interaction': lead.lastInteraction,
        'Priority': lead.priority,
        'Additional Info': lead.additionalInfo
      }));
      
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `Leads_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Leads data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export leads data');
    }
  };

  // Handle loading state with professional skeleton
  if (isLoading) {
    return isMobile ? <CardSkeleton /> : <TableSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading leads: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden w-full">
        {isMobile ? (
          <LeadMobileView 
            leads={filteredLeads} 
            onViewDetails={handleViewDetails} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            navigate={navigate} 
          />
        ) : (
          <LeadDesktopView 
            leads={filteredLeads} 
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            navigate={navigate} 
          />
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLeadMutation.isLoading}
            >
              {deleteLeadMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeadsTable;
