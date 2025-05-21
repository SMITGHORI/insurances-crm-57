
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import LeadDesktopView from './LeadDesktopView';
import LeadMobileView from './LeadMobileView';

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
    priority: 'High'
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
    priority: 'Medium'
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
    priority: 'Low'
  }
];

const LeadsTable = ({ filterParams }) => {
  const navigate = useNavigate();
  const [leads] = useState(dummyLeads);
  const isMobile = useIsMobile();

  // Filter leads based on filterParams
  const filteredLeads = leads.filter(lead => {
    // Filter by status
    if (filterParams.status !== 'all' && lead.status !== filterParams.status) {
      return false;
    }
    
    // Filter by source
    if (filterParams.source !== 'all' && lead.source !== filterParams.source) {
      return false;
    }
    
    // Filter by assigned agent
    if (filterParams.assignedTo !== 'all' && lead.assignedTo !== filterParams.assignedTo) {
      return false;
    }
    
    // Filter by search term
    if (filterParams.searchTerm && !lead.name.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) && 
        !lead.email.toLowerCase().includes(filterParams.searchTerm.toLowerCase()) &&
        !lead.phone.includes(filterParams.searchTerm)) {
      return false;
    }
    
    return true;
  });

  const handleViewDetails = (id) => {
    navigate(`/leads/${id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      {isMobile ? (
        <LeadMobileView leads={filteredLeads} onViewDetails={handleViewDetails} navigate={navigate} />
      ) : (
        <LeadDesktopView leads={filteredLeads} onViewDetails={handleViewDetails} navigate={navigate} />
      )}
    </div>
  );
};

export default LeadsTable;
