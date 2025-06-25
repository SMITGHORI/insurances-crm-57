
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadDetailTabs from '@/components/leads/LeadDetailTabs';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock lead data - in real app, this would come from an API call
  const lead = {
    id: id,
    leadId: 'LD000001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91-9876543210',
    address: '456 Marine Drive, Mumbai, Maharashtra 400002',
    source: 'Website',
    product: 'Health Insurance',
    status: 'In Progress',
    priority: 'High',
    budget: 500000,
    assignedTo: {
      agentId: 'agent-1',
      name: 'Agent John Smith'
    },
    additionalInfo: 'Looking for comprehensive health insurance for family of 4 including dental coverage',
    nextFollowUp: '2024-01-25',
    lastInteraction: '2024-01-20',
    createdAt: '2024-01-15',
    tags: ['Family Coverage', 'Dental', 'High Priority'],
    followUps: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/leads')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {lead.name} ({lead.leadId})
        </h1>
        <p className="text-gray-600">Complete lead information and management</p>
      </div>

      <LeadDetailTabs lead={lead} />
    </div>
  );
};

export default LeadDetail;
