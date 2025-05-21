
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
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  ArrowRight 
} from 'lucide-react';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Qualified':
        return 'bg-green-500';
      case 'Closed':
        return 'bg-gray-500';
      case 'Lost':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1 text-xs">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> {lead.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> {lead.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lead.product}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(lead.status)} text-white`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" /> {lead.assignedTo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {lead.nextFollowUp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getPriorityColor(lead.priority)}>{lead.priority}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/leads/edit/${lead.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(lead.id)}
                      >
                        <ArrowRight className="h-4 w-4" />
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

export default LeadsTable;
