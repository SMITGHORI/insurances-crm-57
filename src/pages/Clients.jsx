
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash, 
  Eye, 
  ArrowUpDown,
  Users,
  Building,
  User,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import ClientForm from '../components/clients/ClientForm';
import { generateClientId, ensureClientIds } from '../utils/idGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientTable from '../components/clients/ClientTable';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientTypeFilter, setClientTypeFilter] = useState('all');

  // Sample client data
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

  // Ensure all clients have client IDs on initial load
  useEffect(() => {
    const updatedClients = ensureClientIds(clients);
    setClients(updatedClients);
  }, []);

  // Filter options
  const filterOptions = ['All', 'Individual', 'Corporate', 'Group', 'Active', 'Inactive'];

  // Filtered clients based on searchTerm, selectedFilter and clientTypeFilter
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
      id: clients.length + 1,
      clientId: newClientId,
      ...clientData,
      policies: 0,
      status: 'Active'
    };
    
    // Add to clients list
    setClients([...clients, newClient]);
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
      toast.success(`Client ${clientToDelete?.name || `ID: ${id}`} has been deleted`);
    }
  };

  // Handle export
  const handleExport = () => {
    // In a real application, this would generate a CSV or Excel file
    const exportData = filteredClients.map(({ id, clientId, name, type, contact, email, location, policies, status }) => 
      ({ id, clientId, name, type, contact, email, location, policies, status })
    );
    
    // Create a CSV string
    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(client => Object.values(client).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
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
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amba-blue focus:border-amba-blue sm:text-sm"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-amba-blue focus:border-amba-blue sm:text-sm"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Client Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Tabs defaultValue="all" onValueChange={(value) => setClientTypeFilter(value)}>
          <div className="border-b border-gray-200 px-4">
            <TabsList className="flex gap-4 -mb-px overflow-x-auto no-scrollbar">
              <TabsTrigger
                value="all"
                className="py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                All Clients
              </TabsTrigger>
              <TabsTrigger 
                value="individual"
                className="py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                <User className="h-4 w-4 mr-1 inline" />
                Individual
              </TabsTrigger>
              <TabsTrigger 
                value="corporate"
                className="py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                <Building className="h-4 w-4 mr-1 inline" />
                Corporate
              </TabsTrigger>
              <TabsTrigger 
                value="group"
                className="py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-1 inline" />
                Group
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <ClientTable 
              clients={filteredClients}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
            />
          </TabsContent>
          
          <TabsContent value="individual">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Individual')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
            />
          </TabsContent>
          
          <TabsContent value="corporate">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Corporate')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
            />
          </TabsContent>
          
          <TabsContent value="group">
            <ClientTable 
              clients={filteredClients.filter(client => client.type === 'Group')}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
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
