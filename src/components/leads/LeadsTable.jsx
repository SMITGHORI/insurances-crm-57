
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import LeadDesktopView from './LeadDesktopView';
import LeadMobileView from './LeadMobileView';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Dummy lead data
const dummyLeads = [
  {
    id: 'LD001',
    name: 'Arun Sharma',
    phone: '9876543210',
    email: 'arun.sharma@example.com',
    source: 'Website',
    product: 'Health Insurance',
    status: 'New',
    createdAt: '2025-04-10',
    assignedTo: 'Raj Malhotra',
    nextFollowUp: '2025-05-22',
    lastInteraction: '2025-05-15',
    priority: 'High',
    additionalInfo: 'Looking for family health insurance plan for 4 members'
  },
  {
    id: 'LD002',
    name: 'Priya Patel',
    phone: '8765432109',
    email: 'priya.patel@example.com',
    source: 'Referral',
    product: 'Term Life Insurance',
    status: 'In Progress',
    createdAt: '2025-04-12',
    assignedTo: 'Anita Kumar',
    nextFollowUp: '2025-05-25',
    lastInteraction: '2025-05-16',
    priority: 'Medium',
    additionalInfo: 'Needs a long-term investment plan with life coverage'
  },
  {
    id: 'LD003',
    name: 'Vikram Singh',
    phone: '7654321098',
    email: 'vikram.singh@example.com',
    source: 'Cold Call',
    product: 'Motor Insurance',
    status: 'Qualified',
    createdAt: '2025-04-15',
    assignedTo: 'Raj Malhotra',
    nextFollowUp: '2025-05-24',
    lastInteraction: '2025-05-14',
    priority: 'Low',
    additionalInfo: 'Has multiple vehicles and looking for fleet insurance'
  },
  {
    id: 'LD004',
    name: 'Sunita Gupta',
    phone: '9988776655',
    email: 'sunita.gupta@example.com',
    source: 'Event',
    product: 'Home Insurance',
    status: 'Not Interested',
    createdAt: '2025-04-18',
    assignedTo: 'Vikram Mehta',
    nextFollowUp: '2025-06-15',
    lastInteraction: '2025-05-10',
    priority: 'Medium',
    additionalInfo: 'Recently purchased new property'
  },
  {
    id: 'LD005',
    name: 'Rahul Verma',
    phone: '9876123450',
    email: 'rahul.verma@example.com',
    source: 'Social Media',
    product: 'Travel Insurance',
    status: 'In Progress',
    createdAt: '2025-04-20',
    assignedTo: 'Anita Kumar',
    nextFollowUp: '2025-05-28',
    lastInteraction: '2025-05-18',
    priority: 'High',
    additionalInfo: 'Planning international trip in June'
  }
];

const LeadsTable = ({ 
  filterParams, 
  sortField, 
  sortDirection,
  handleExport: parentHandleExport
}) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(dummyLeads);
  const [filteredLeads, setFilteredLeads] = useState(dummyLeads);
  const isMobile = useIsMobile();
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter and sort leads when filterParams, sortField, or sortDirection change
  useEffect(() => {
    let result = [...leads];
    
    // Apply filters
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
    
    // Apply sorting
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

  const confirmDelete = () => {
    // In a real app, this would make an API call
    const updatedLeads = leads.filter(lead => lead.id !== leadToDelete);
    setLeads(updatedLeads);
    setShowDeleteDialog(false);
    toast.success("Lead deleted successfully");
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeadsTable;
