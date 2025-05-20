
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
  User
} from 'lucide-react';
import { toast } from 'sonner';
import ClientForm from '../components/clients/ClientForm';
import { generateClientId, ensureClientIds } from '../utils/idGenerator';
import { Button } from '@/components/ui/button';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample client data
  const [clients, setClients] = useState([
    {
      id: 1,
      clientId: 'AMB-CLI-20250520-0001',
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
      clientId: 'AMB-CLI-20250520-0002',
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

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.includes(searchTerm) ||
      client.clientId.includes(searchTerm);
    
    const matchesFilter = selectedFilter === 'All' || 
      client.type === selectedFilter || 
      client.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle adding a new client
  const handleAddClient = () => {
    setShowAddModal(true);
  };

  // Handle client form submission
  const handleClientFormSuccess = (clientData) => {
    // Generate a unique client ID
    const existingIds = clients.map(client => client.clientId);
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
    toast.success(`Client ID: ${id} has been deleted`);
  };

  // Handle export
  const handleExport = () => {
    toast.success('Clients exported successfully');
  };

  const getClientTypeIcon = (type) => {
    switch (type) {
      case 'Individual':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'Corporate':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'Group':
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
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
          <div className="flex items-center space-x-2">
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
            <div className="relative">
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

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Client ID</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Client</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Contact</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Policies</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">
                    {client.clientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getClientTypeIcon(client.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${client.type === 'Individual' ? 'bg-blue-100 text-blue-800' : 
                        client.type === 'Corporate' ? 'bg-purple-100 text-purple-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.policies}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{' '}
                <span className="font-medium">8</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  Previous
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-amba-blue border-amba-blue text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  Next
                </a>
              </nav>
            </div>
          </div>
        </div>
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
                <ClientForm 
                  onClose={() => setShowAddModal(false)}
                  onSuccess={handleClientFormSuccess}
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
