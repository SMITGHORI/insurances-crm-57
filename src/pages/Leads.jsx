
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Leads = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    priority: 'all',
    searchTerm: ''
  });
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateLead = () => {
    navigate('/leads/create');
  };

  const updateActiveFilters = (name, value) => {
    if (value === null) {
      setActiveFilters(activeFilters.filter(filter => filter.name !== name));
      return;
    }
    
    const existingFilterIndex = activeFilters.findIndex(filter => filter.name === name);
    if (existingFilterIndex !== -1) {
      const updatedFilters = [...activeFilters];
      updatedFilters[existingFilterIndex] = { name, value };
      setActiveFilters(updatedFilters);
    } else {
      setActiveFilters([...activeFilters, { name, value }]);
    }
  };

  const removeFilter = (filterName) => {
    if (filterName === 'Status') {
      setFilterParams({...filterParams, status: 'all'});
    } else if (filterName === 'Source') {
      setFilterParams({...filterParams, source: 'all'});
    } else if (filterName === 'Agent') {
      setFilterParams({...filterParams, assignedTo: 'all'});
    } else if (filterName === 'Priority') {
      setFilterParams({...filterParams, priority: 'all'});
    }
    setActiveFilters(activeFilters.filter(filter => filter.name !== filterName));
  };

  const handleExport = (leads) => {
    // This will be handled by the LeadsTable component
    toast.success("Leads exported successfully");
  };

  const clearActiveFilters = () => {
    setActiveFilters([]);
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Leads Management</h1>
        <Button onClick={handleCreateLead} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Lead'}
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <LeadFilters 
          filterParams={filterParams} 
          setFilterParams={setFilterParams}
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
          handleExport={handleExport}
          activeFilters={activeFilters}
          removeFilter={removeFilter}
        />
      </Card>
      
      <div className="max-w-full overflow-hidden mb-20 sm:mb-0">
        <LeadsTable 
          filterParams={filterParams}
          sortField={sortField}
          sortDirection={sortDirection}
          handleExport={handleExport}
        />
      </div>
    </div>
  );
};

export default Leads;
