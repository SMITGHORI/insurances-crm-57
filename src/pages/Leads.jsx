
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';

const Leads = () => {
  const navigate = useNavigate();
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
    <div className="w-full mx-auto px-1 sm:px-4 py-3 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Leads Management</h1>
        <Button onClick={handleCreateLead} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Lead
        </Button>
      </div>

      <LeadFilters filterParams={filterParams} setFilterParams={setFilterParams} />
      <LeadsTable filterParams={filterParams} />
    </div>
  );
};

export default Leads;
