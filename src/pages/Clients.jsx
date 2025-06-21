
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Building, User, Group } from 'lucide-react';
import { toast } from 'sonner';
import ClientForm from '../components/clients/ClientForm';
import ClientFilters from '../components/clients/ClientFilters';
import ClientStatsCards from '../components/clients/ClientStatsCards';
import BulkOperationsToolbar from '../components/clients/BulkOperationsToolbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientTable from '../components/clients/ClientTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClients, useDeleteClient, useCreateClient } from '../hooks/useClients';
import { useBulkClientOperations, useClientExport } from '../hooks/useClientFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import RouteGuard from '../components/RouteGuard';

/**
 * Clients page with role-based permissions
 */
const Clients = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { hasPermission, isAgent, isSuperAdmin } = usePermissions();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedClients, setSelectedClients] = useState([]);

  // API query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    type: clientTypeFilter,
    status: selectedFilter,
    sortField,
    sortDirection,
  };

  // React Query hooks
  const {
    data: clientsResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useClients(queryParams);

  const createClientMutation = useCreateClient();
  const deleteClientMutation = useDeleteClient();
  const { bulkAssign, bulkStatusUpdate, bulkDelete } = useBulkClientOperations();
  const exportMutation = useClientExport();

  // Extract data from API response
  const clients = clientsResponse?.data || [];
  const totalClients = clientsResponse?.total || 0;
  const totalPages = clientsResponse?.totalPages || 1;

  // Filter options
  const filterOptions = ['All', 'Active', 'Inactive', 'Pending'];

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle adding a new client
  const handleAddClient = () => {
    setShowAddModal(true);
  };

  // Handle client form submission
  const handleClientFormSuccess = async (clientData) => {
    try {
      await createClientMutation.mutateAsync(clientData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  // Handle edit client with permission check
  const handleEditClient = (id) => {
    if (isAgent()) {
      const client = clients.find(c => c._id === id);
      if (client?.assignedAgentId !== user.id) {
        toast.error('You can only edit clients assigned to you');
        return;
      }
    }
    navigate(`/clients/edit/${id}`);
  };

  // Handle view client details
  const handleViewClient = (id) => {
    navigate(`/clients/${id}`);
  };

  // Handle delete client with permission check
  const handleDeleteClient = async (id) => {
    if (!hasPermission('deleteClient')) {
      toast.error('You do not have permission to delete clients');
      return;
    }

    const client = clients.find(c => c._id === id);
    const clientName = client?.name || `Client ID: ${id}`;
    
    if (window.confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`)) {
      try {
        await deleteClientMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  // Handle export
  const handleExport = async (exportData) => {
    try {
      await exportMutation.mutateAsync(exportData);
    } catch (error) {
      toast.error('Failed to export clients');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Bulk operations handlers
  const handleBulkAssign = async (clientIds, agentId) => {
    await bulkAssign({ clientIds, agentId });
    setSelectedClients([]);
  };

  const handleBulkStatusUpdate = async (clientIds, status) => {
    await bulkStatusUpdate({ clientIds, status });
    setSelectedClients([]);
  };

  const handleBulkDelete = async (clientIds) => {
    await bulkDelete(clientIds);
    setSelectedClients([]);
  };

  const handleBulkExport = (clients) => {
    const exportData = {
      type: 'selected',
      format: 'csv',
      selectedIds: clients.map(c => c._id || c.id)
    };
    handleExport(exportData);
  };

  // Filter clients by type for tabs
  const getFilteredClients = (type) => {
    if (type === 'all') return clients;
    return clients.filter(client => 
      client.type?.toLowerCase() === type.toLowerCase()
    );
  };

  // Loading state with professional skeleton
  if (isLoading && currentPage === 1) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Failed to load clients: {error?.message || 'Unknown error'}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <RouteGuard route="/clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
          {hasPermission('createClient') && (
            <Button
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 bg-amba-blue text-white rounded-md hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
              disabled={createClientMutation.isLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              {createClientMutation.isLoading ? 'Adding...' : 'Add Client'}
            </Button>
          )}
        </div>

        {/* Client Statistics Cards */}
        <ClientStatsCards />

        {/* Role-based info banner for agents */}
        {isAgent() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Agent View:</strong> You can only view and manage clients assigned to you. 
              Some fields may be read-only based on your permissions.
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <ClientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filterOptions}
          handleExport={handleExport}
          onSearchChange={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          onFilterChange={(filter) => {
            setSelectedFilter(filter);
            setCurrentPage(1);
          }}
          showExport={hasPermission('viewAllClients')}
          selectedClients={selectedClients}
          filteredData={getFilteredClients(clientTypeFilter)}
          allData={clients}
        />

        {/* Bulk Operations Toolbar */}
        <BulkOperationsToolbar
          selectedClients={selectedClients}
          onClearSelection={() => setSelectedClients([])}
          onBulkAssign={handleBulkAssign}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
        />

        {/* Enhanced Client Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Tabs 
            value={clientTypeFilter} 
            onValueChange={(value) => {
              setClientTypeFilter(value);
              setCurrentPage(1);
            }}
            className="w-full"
          >
          <div className="border-b border-gray-200">
            <TabsList className="h-auto w-full bg-transparent p-0 flex justify-around">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-amba-blue data-[state=active]:border-b-2 data-[state=active]:border-amba-blue rounded-none py-4 px-6 flex-1 text-gray-600 font-medium text-sm transition-all duration-200 hover:bg-gray-50"
              >
                <Users className="h-5 w-5 mr-2" />
                <span>All Clients ({totalClients})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="individual"
                className="data-[state=active]:bg-white data-[state=active]:text-amba-blue data-[state=active]:border-b-2 data-[state=active]:border-amba-blue rounded-none py-4 px-6 flex-1 text-gray-600 font-medium text-sm transition-all duration-200 hover:bg-gray-50"
              >
                <User className="h-5 w-5 mr-2" />
                <span>Individual</span>
              </TabsTrigger>
              <TabsTrigger 
                value="corporate"
                className="data-[state=active]:bg-white data-[state=active]:text-amba-blue data-[state=active]:border-b-2 data-[state=active]:border-amba-blue rounded-none py-4 px-6 flex-1 text-gray-600 font-medium text-sm transition-all duration-200 hover:bg-gray-50"
              >
                <Building className="h-5 w-5 mr-2" />
                <span>Corporate</span>
              </TabsTrigger>
              <TabsTrigger 
                value="group"
                className="data-[state=active]:bg-white data-[state=active]:text-amba-blue data-[state=active]:border-b-2 data-[state=active]:border-amba-blue rounded-none py-4 px-6 flex-1 text-gray-600 font-medium text-sm transition-all duration-200 hover:bg-gray-50"
              >
                <Group className="h-5 w-5 mr-2" />
                <span>Group</span>
              </TabsTrigger>
            </TabsList>
          </div>

            {['all', 'individual', 'corporate', 'group'].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="p-0 mt-0 animate-fade-in">
                <ClientTable 
                  clients={getFilteredClients(tabValue)}
                  onViewClient={handleViewClient}
                  onEditClient={handleEditClient}
                  onDeleteClient={handleDeleteClient}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  isMobile={isMobile}
                  isLoading={isLoading}
                  isEmpty={clients.length === 0}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalClients}
                  onPageChange={handlePageChange}
                  isDeleting={deleteClientMutation.isLoading}
                  canEdit={hasPermission('editAnyClient') || isAgent()}
                  canDelete={hasPermission('deleteClient')}
                  userRole={user?.role}
                  userId={user?.id}
                  selectedClients={selectedClients}
                  onSelectionChange={setSelectedClients}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Add Client Modal */}
        {showAddModal && hasPermission('createClient') && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Client</h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowAddModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <span className="text-xl font-medium">&times;</span>
                    </button>
                  </div>
                  <ClientForm 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleClientFormSuccess}
                    isLoading={createClientMutation.isLoading}
                    userRole={user?.role}
                    userId={user?.id}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
};

export default Clients;
