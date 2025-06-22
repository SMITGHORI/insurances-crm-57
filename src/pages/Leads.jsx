
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import LeadStatsCards from '@/components/leads/LeadStatsCards';
import BulkOperationsToolbar from '@/components/leads/BulkOperationsToolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showReports, setShowReports] = useState(false);

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
    toast.success("Leads exported successfully");
  };

  const handleBulkAction = (action, leadIds) => {
    console.log('Bulk action:', action, leadIds);
    // Handle bulk actions here
    switch(action) {
      case 'delete':
        toast.success(`${leadIds.length} leads deleted successfully`);
        break;
      case 'convert':
        toast.success(`${leadIds.length} leads converted to clients successfully`);
        break;
      default:
        toast.info(`Bulk action ${action} performed on ${leadIds.length} leads`);
    }
  };

  const handleLeadSelection = (leadId, selected) => {
    if (selected) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
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
        <div className="flex gap-2">
          <Dialog open={showReports} onOpenChange={setShowReports}>
            <DialogTrigger asChild>
              <Button variant="outline" className={isMobile ? "w-full" : ""}>
                <BarChart className="mr-2 h-4 w-4" /> Reports
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lead Reports & Analytics</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-gray-500">Lead reports component will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleCreateLead} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Lead'}
          </Button>
        </div>
      </div>

      {/* Lead Statistics Cards */}
      <LeadStatsCards />

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

      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedLeads={selectedLeads}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
        agents={[]} // Add agents data here when available
      />
      
      <div className="max-w-full overflow-hidden mb-20 sm:mb-0">
        <LeadsTable 
          filterParams={filterParams}
          sortField={sortField}
          sortDirection={sortDirection}
          handleExport={handleExport}
          selectedLeads={selectedLeads}
          onLeadSelection={handleLeadSelection}
        />
      </div>
    </div>
  );
};

export default Leads;
