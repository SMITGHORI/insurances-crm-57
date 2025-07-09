
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart, Download, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadsTable from '@/components/leads/LeadsTable';
import LeadFilters from '@/components/leads/LeadFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import LeadStatsCards from '@/components/leads/LeadStatsCards';
import BulkOperationsToolbar from '@/components/leads/BulkOperationsToolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Protected from '@/components/Protected';
import { useLeads, useExportLeads } from '../hooks/useLeads';

const Leads = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    source: 'all',
    assignedTo: 'all',
    priority: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showReports, setShowReports] = useState(false);

  // Connect to MongoDB for leads data
  const { data: leadsResponse, isLoading, error, refetch } = useLeads({
    ...filterParams,
    search: filterParams.searchTerm,
    sortBy: sortField,
    sortOrder: sortDirection
  });

  // Connect to MongoDB for export
  const exportLeadsMutation = useExportLeads();

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      if (error && error.message.includes('Network error')) {
        setConnectionStatus('disconnected');
      } else if (error && error.message.includes('Failed to fetch')) {
        setConnectionStatus('disconnected');
      } else if (!error && leadsResponse) {
        setConnectionStatus('connected');
      }
    };

    checkConnection();
  }, [error, leadsResponse]);

  // Auto-retry connection
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      const retryTimer = setTimeout(() => {
        console.log('Attempting to reconnect to database...');
        refetch();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [connectionStatus, refetch]);

  const leads = leadsResponse?.leads || [];
  const pagination = leadsResponse?.pagination || {};

  const handleCreateLead = () => {
    navigate('/leads/create');
  };

  const handleExport = async () => {
    try {
      console.log('Exporting leads from MongoDB with filters:', filterParams);
      
      await exportLeadsMutation.mutateAsync(filterParams);
      
      console.log('Leads exported successfully from MongoDB');
      toast.success('Leads data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export leads: ${error.message}`);
    }
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
      setFilterParams({...filterParams, status: 'all', page: 1});
    } else if (filterName === 'Source') {
      setFilterParams({...filterParams, source: 'all', page: 1});
    } else if (filterName === 'Agent') {
      setFilterParams({...filterParams, assignedTo: 'all', page: 1});
    } else if (filterName === 'Priority') {
      setFilterParams({...filterParams, priority: 'all', page: 1});
    }
    setActiveFilters(activeFilters.filter(filter => filter.name !== filterName));
  };

  const handleBulkAction = (action, leadIds) => {
    console.log('Bulk action:', action, leadIds);
    toast.info(`Bulk ${action} operation initiated for ${leadIds.length} leads`);
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

  const handleRetryConnection = () => {
    console.log('Manual retry connection requested');
    setConnectionStatus('connecting');
    refetch();
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Connection Status Alert */}
      {connectionStatus === 'disconnected' && (
        <Alert className="mb-4 border-destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Database connection lost. Attempting to reconnect...</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryConnection}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'connected' && leadsResponse && (
        <Alert className="mb-4 border-green-500">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Connected to MongoDB • Real-time database operations active
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            MongoDB Integration • {leads.length} leads loaded
            {pagination.totalItems && ` • ${pagination.totalItems} total`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Protected module="leads" action="view">
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
                  <p className="text-gray-500">Lead reports and analytics will be displayed here with real-time data from MongoDB</p>
                </div>
              </DialogContent>
            </Dialog>
          </Protected>
          
          <Protected module="leads" action="export">
            <Button 
              variant="outline" 
              className={isMobile ? "w-full" : ""}
              onClick={handleExport}
              disabled={exportLeadsMutation.isLoading || connectionStatus === 'disconnected'}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {exportLeadsMutation.isLoading ? 'Exporting...' : 'Export'}
            </Button>
          </Protected>
          
          <Protected module="leads" action="create">
            <Button 
              onClick={handleCreateLead} 
              className={isMobile ? "w-full" : ""}
              disabled={connectionStatus === 'disconnected'}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Lead
            </Button>
          </Protected>
        </div>
      </div>

      {/* Lead Statistics Cards */}
      <LeadStatsCards />

      <div className="mb-6">
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
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedLeads={selectedLeads}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
        agents={[]} // Add agents data here when available
      />
      
      {/* Error State */}
      {error && connectionStatus !== 'disconnected' && (
        <Alert className="mb-4 border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Error loading leads: {error.message}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <LeadsTable 
        leads={leads}
        pagination={pagination}
        isLoading={isLoading}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        sortField={sortField}
        sortDirection={sortDirection}
        setSortField={setSortField}
        setSortDirection={setSortDirection}
        selectedLeads={selectedLeads}
        onLeadSelection={handleLeadSelection}
      />
    </div>
  );
};

export default Leads;
