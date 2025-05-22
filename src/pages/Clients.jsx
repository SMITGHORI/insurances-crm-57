
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Users, Building, User, Group } from 'lucide-react';
import { toast } from 'sonner';
import ClientForm from '../components/clients/ClientForm';
import ClientFilters from '../components/clients/ClientFilters';
import { generateClientId, ensureClientIds } from '../utils/idGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientTable from '../components/clients/ClientTable';
import { useIsMobile } from '@/hooks/use-mobile';

const Clients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Initialize clients state with sample data
  const [clients, setClients] = useState([
    {
      id: 1,
      clientId: 'AMB-CLI-2025-0001',
      name: 'Rahul Sharma',
      type: 'Individual',
      contact: '+91 9876543210',
      email: 'rahul.sharma@example.com',
      location: 'Mumbai, Maharashtra',
      policies: 3,
      status: 'Active',
    },
    {
      id: 2,
      clientId: 'AMB-CLI-2025-0002',
      name: 'Tech Solutions Ltd',
      type: 'Corporate',
      contact: '+91 2234567890',
      email: 'info@techsolutions.com',
      location: 'Bangalore, Karnataka',
      policies: 8,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Sanjay Group',
      type: 'Group',
      contact: '+91 8765432109',
      email: 'contact@sanjaygroup.com',
      location: 'Delhi, Delhi',
      policies: 12,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Priya Desai',
      type: 'Individual',
      contact: '+91 7654321098',
      email: 'priya.desai@example.com',
      location: 'Pune, Maharashtra',
      policies: 2,
      status: 'Inactive',
    },
    {
      id: 5,
      name: 'Global Services Inc',
      type: 'Corporate',
      contact: '+91 6543210987',
      email: 'info@globalservices.com',
      location: 'Chennai, Tamil Nadu',
      policies: 5,
      status: 'Active',
    },
    {
      id: 6,
      name: 'Family Health Group',
      type: 'Group',
      contact: '+91 5432109876',
      email: 'contact@familyhealth.org',
      location: 'Hyderabad, Telangana',
      policies: 9,
      status: 'Active',
    },
    {
      id: 7,
      name: 'Vikram Malhotra',
      type: 'Individual',
      contact: '+91 4321098765',
      email: 'vikram.m@example.com',
      location: 'Jaipur, Rajasthan',
      policies: 1,
      status: 'Active',
    },
    {
      id: 8,
      name: 'Innovative Tech Ltd',
      type: 'Corporate',
      contact: '+91 3210987654',
      email: 'hr@innovativetech.in',
      location: 'Ahmedabad, Gujarat',
      policies: 4,
      status: 'Inactive',
    },
  ]);

  // Load clients from localStorage on initial load
  useEffect(() => {
    const storedClientsData = localStorage.getItem('clientsData');
    
    if (storedClientsData) {
      setClients(JSON.parse(storedClientsData));
    } else {
      // If no data in localStorage, ensure all clients have client IDs and save to localStorage
      const updatedClients = ensureClientIds(clients);
      setClients(updatedClients);
      localStorage.setItem('clientsData', JSON.stringify(updatedClients));
    }
    
    // Check if we have a client filter from another page
    const params = new URLSearchParams(location.search);
    const clientFilter = params.get('filter');
    if (clientFilter) {
      setSelectedFilter(clientFilter);
    }
  }, [location]);

  // Update localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem('clientsData', JSON.stringify(clients));
  }, [clients]);

  // Filter options
  const filterOptions = ['All', 'Individual', 'Corporate', 'Group', 'Active', 'Inactive'];

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact?.includes(searchTerm) ||
      (client.clientId && client.clientId.includes(searchTerm));
    
    const matchesStatusFilter = selectedFilter === 'All' || 
      client.status === selectedFilter;
    
    const matchesTypeFilter = clientTypeFilter === 'all' || 
      client.type?.toLowerCase() === clientTypeFilter;
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  }).sort((a, b) => {
    if (!a[sortField] && !b[sortField]) return 0;
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;

    const compareA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
    const compareB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle adding a new client
  const handleAddClient = () => {
    setShowAddModal(true);
  };

  // Handle client form submission
  const handleClientFormSuccess = (clientData) => {
    // Generate a unique client ID
    const existingIds = clients.map(client => client.clientId).filter(Boolean);
    const newClientId = generateClientId(existingIds);
    
    // Create new client with ID
    const newClient = {
      id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
      clientId: newClientId,
      ...clientData,
      policies: 0,
      status: 'Active'
    };
    
    // Add to clients list
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    
    // Update localStorage
    localStorage.setItem('clientsData', JSON.stringify(updatedClients));
    
    toast.success(`Client ${clientData.name} added successfully with ID: ${newClientId}`);
    setShowAddModal(false);
  };

  // Handle edit client
  const handleEditClient = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  // Handle view client details
  const handleViewClient = (id) => {
    navigate(`/clients/${id}`);
  };

  // Handle delete client
  const handleDeleteClient = (id) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this client?')) {
      const clientToDelete = clients.find(client => client.id === id);
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      
      // Update localStorage
      localStorage.setItem('clientsData', JSON.stringify(updatedClients));
      
      toast.success(`Client ${clientToDelete?.name || `ID: ${id}`} has been deleted`);
    }
  };

  // Handle export
  const handleExport = () => {
    // Create a CSV string
    const headers = ['ID', 'Client ID', 'Name', 'Type', 'Contact', 'Email', 'Location', 'Policies', 'Status'];
    const rows = filteredClients.map(client => [
      client.id,
      client.clientId || '',
      client.name || '',
      client.type || '',
      client.contact || '',
      client.email || '',
      client.location || '',
      client.policies || 0,
      client.status || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Clients exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
        <Button
          onClick={handleAddClient}
          className="inline-flex items-center px-4 py-2 bg-amba-blue text-white rounded-md hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters and Search */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        filterOptions={filterOptions}
        handleExport={handleExport}
      />

      {/* Enhanced Client Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Tabs 
          value={clientTypeFilter} 
          onValueChange={setClientTypeFilter} 
          className="w-full"
        >
          <div className="border-b border-gray-200">
            <TabsList className="h-auto w-full bg-transparent p-0 flex justify-around">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-amba-blue data-[state=active]:border-b-2 data-[state=active]:border-amba-blue rounded-none py-4 px-6 flex-1 text-gray-600 font-medium text-sm transition-all duration-200 hover:bg-gray-50"
              >
                <Users className="h-5 w-5 mr-2" />
                <span>All Clients</span>
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

          <TabsContent value="all" className="p-0 mt-0 animate-fade-in">
            <ClientTable 
              clients={filteredClients}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              isMobile={isMobile}
            />
          </TabsContent>
          
          <TabsContent value="individual" className="p-0 mt-0 animate-fade-in">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Individual')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              isMobile={isMobile}
            />
          </TabsContent>
          
          <TabsContent value="corporate" className="p-0 mt-0 animate-fade-in">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Corporate')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              isMobile={isMobile}
            />
          </TabsContent>
          
          <TabsContent value="group" className="p-0 mt-0 animate-fade-in">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Group')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              isMobile={isMobile}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
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
                  existingClients={clients}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
