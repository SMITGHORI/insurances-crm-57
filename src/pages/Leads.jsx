
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';

const Leads = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    searchTerm: ''
  });

  const handleCreateLead = () => {
    navigate('/leads/create');
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Leads Management</h1>
        <Button onClick={handleCreateLead} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Lead'}
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <LeadFilters filterParams={filterParams} setFilterParams={setFilterParams} />
      </Card>
      
      <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
        <LeadsTable filterParams={filterParams} />
      </div>
    </div>
  );
};

export default Leads;
