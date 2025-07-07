
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
import { useClients, useDeleteClient, useCreateClient, useBulkClientOperations, useClientExport } from '../hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import RouteGuard from '../components/RouteGuard';
import Protected from '@/components/Protected';

/**
 * Clients page with MongoDB integration - fully connected to database
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

  // API query parameters for MongoDB
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    type: clientTypeFilter,
    status: selectedFilter,
    sortField,
    sortDirection,
  };

  // React Query hooks - all connected to MongoDB
  const {
    data: clientsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useClients(queryParams);

  const createClientMutation = useCreateClient();
  const deleteClientMutation = useDeleteClient();
  const { bulkAssign, bulkUpdate, bulkDelete } = useBulkClientOperations();
  const exportMutation = useClientExport();

  // Extract data from MongoDB API response
  const clients = clientsResponse?.data || [];
  const totalClients = clientsResponse?.total || 0;
  const totalPages = clientsResponse?.totalPages || 1;

  console.log('Clients page - MongoDB data:', {
    clients: clients.length,
    totalClients,
    totalPages,
    currentPage,
    isLoading,
    isFetching
  });

  // Filter options
  const filterOptions = ['All', 'Active', 'Inactive', 'Pending'];

  // Handle sorting
  const handleSort = (field) => {
    console.log('Sorting clients by:', field);
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle adding a new client to MongoDB
  const handleAddClient = () => {
    console.log('Opening add client form');
    setShowAddModal(true);
  };

  // Handle client form submission to MongoDB
  const handleClientFormSuccess = async (clientData) => {
    try {
      console.log('Submitting client form to MongoDB:', clientData);
      await createClientMutation.mutateAsync(clientData);
      console.log('Client successfully created in MongoDB');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create client in MongoDB:', error);
    }
  };

  // Handle edit client with permission check
  const handleEditClient = (id) => {
    console.log('Editing client:', id);
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
    console.log('Viewing client:', id);
    navigate(`/clients/${id}`);
  };

  // Handle delete client from MongoDB with permission check
  const handleDeleteClient = async (id) => {
    if (!hasPermission('deleteClient')) {
      toast.error('You do not have permission to delete clients');
      return;
    }

    const client = clients.find(c => c._id === id);
    const clientName = client?.displayName || client?.name || `Client ID: ${id}`;
    
    if (window.confirm(`Are you sure you want to delete "${clientName}" from the database? This action cannot be undone.`)) {
      try {
        console.log('Deleting client from MongoDB:', id);
        await deleteClientMutation.mutateAsync(id);
        console.log('Client successfully deleted from MongoDB');
      } catch (error) {
        console.error('Failed to delete client from MongoDB:', error);
      }
    }
  };

  // Handle export from MongoDB
  const handleExport = async (exportData) => {
    try {
      console.log('Exporting clients from MongoDB:', exportData);
      await exportMutation.mutateAsync(exportData);
      console.log('Clients successfully exported from MongoDB');
    } catch (error) {
      console.error('Failed to export clients from MongoDB:', error);
      toast.error('Failed to export clients from database');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    console.log('Changing page to:', page);
    setCurrentPage(page);
  };

  // Bulk operations handlers for MongoDB
  const handleBulkAssign = async (clientIds, agentId) => {
    console.log('Bulk assigning clients in MongoDB:', { clientIds, agentId });
    await bulkAssign.mutateAsync({ clientIds, agentId });
    setSelectedClients([]);
  };

  const handleBulkStatusUpdate = async (clientIds, status) => {
    console.log('Bulk updating client status in MongoDB:', { clientIds, status });
    await bulkUpdate.mutateAsync({ 
      clientIds, 
      updateData: { status } 
    });
    setSelectedClients([]);
  };

  const handleBulkDelete = async (clientIds) => {
    if (window.confirm(`Are you sure you want to delete ${clientIds.length} clients from the database? This action cannot be undone.`)) {
      console.log('Bulk deleting clients from MongoDB:', clientIds);
      await bulkDelete.mutateAsync(clientIds);
      setSelectedClients([]);
    }
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
      client.clientType?.toLowerCase() === type.toLowerCase() ||
      client.type?.toLowerCase() === type.toLowerCase()
    );
  };

  // Loading state with professional skeleton
  if (isLoading && currentPage === 1) {
    console.log('Loading clients from MongoDB...');
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Error state
  if (isError) {
    console.error('Error loading clients from MongoDB:', error);
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Failed to load clients from database: {error?.message || 'Unknown error'}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Retry Loading from Database
        </Button>
      </div>
    );
  }

  return (
    <RouteGuard route="/clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Connected to MongoDB • {totalClients} clients in database
              {isFetching && <span className="ml-2 text-blue-600">• Syncing...</span>}
            </p>
          </div>
          <Protected module="clients" action="create">
            <Button
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 bg-amba-blue text-white rounded-md hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
              disabled={createClientMutation.isLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              {createClientMutation.isLoading ? 'Adding to Database...' : 'Add Client'}
            </Button>
          </Protected>
        </div>

        {/* Client Statistics Cards - connected to MongoDB */}
        <ClientStatsCards />

        {/* Role-based info banner for agents */}
        {isAgent() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Agent View:</strong> You can only view and manage clients assigned to you from the database. 
              Some fields may be read-only based on your permissions.
            </div>
          </div>
        )}

        {/* Filters and Search - all operations query MongoDB */}
        <ClientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filterOptions}
          handleExport={handleExport}
          onSearchChange={(term) => {
            console.log('Searching clients in MongoDB:', term);
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          onFilterChange={(filter) => {
            console.log('Filtering clients in MongoDB:', filter);
            setSelectedFilter(filter);
            setCurrentPage(1);
          }}
          showExport={hasPermission('viewAllClients')}
          selectedClients={selectedClients}
          filteredData={getFilteredClients(clientTypeFilter)}
          allData={clients}
        />

        {/* Bulk Operations Toolbar - all operations update MongoDB */}
        <BulkOperationsToolbar
          selectedClients={selectedClients}
          onClearSelection={() => setSelectedClients([])}
          onBulkAssign={handleBulkAssign}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
        />

        {/* Enhanced Client Tabs - all data from MongoDB */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Tabs 
            value={clientTypeFilter} 
            onValueChange={(value) => {
              console.log('Changing client type filter:', value);
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
                  isLoading={isLoading || isFetching}
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

        {/* Add Client Modal - saves to MongoDB */}
        {showAddModal && (
          <Protected module="clients" action="create">
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Add New Client</h3>
                        <p className="text-sm text-gray-500">Client will be saved to MongoDB database</p>
                      </div>
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
                      onSubmit={handleClientFormSuccess}
                      onCancel={() => setShowAddModal(false)}
                      isLoading={createClientMutation.isLoading}
                      userRole={user?.role}
                      userId={user?.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Protected>
        )}
      </div>
    </RouteGuard>
  );
};

export default Clients;
