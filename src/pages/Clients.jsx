
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash, 
  Eye, 
  ArrowUpDown,
  Users,
  Building,
  UserPlus,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientType, setClientType] = useState('individual');

  // Sample client data
  const clients = [
    {
      id: 1,
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
  ];

  // Filter options
  const filterOptions = ['All', 'Individual', 'Corporate', 'Group', 'Active', 'Inactive'];

  // Filtered clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.includes(searchTerm);
    
    const matchesFilter = selectedFilter === 'All' || 
      client.type === selectedFilter || 
      client.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle adding a new client
  const handleAddClient = () => {
    setShowAddModal(true);
  };

  // Handle edit client
  const handleEditClient = (id) => {
    toast.info(`Editing client ID: ${id}`);
    navigate(`/clients/edit/${id}`);
  };

  // Handle view client details
  const handleViewClient = (id) => {
    toast.info(`Viewing client ID: ${id}`);
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
        <button
          onClick={handleAddClient}
          className="inline-flex items-center px-4 py-2 bg-amba-blue text-white rounded-md hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </button>
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
                    <span>Location</span>
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
                    {client.location}
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

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add New Client
                    </h3>
                    
                    <div className="mt-4">
                      {/* Client Type Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Type
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          <button
                            type="button"
                            className={`py-2 px-3 rounded-md flex flex-col items-center justify-center text-sm ${
                              clientType === 'individual' 
                                ? 'bg-amba-blue text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setClientType('individual')}
                          >
                            <User className="h-6 w-6 mb-1" />
                            Individual
                          </button>
                          <button
                            type="button"
                            className={`py-2 px-3 rounded-md flex flex-col items-center justify-center text-sm ${
                              clientType === 'corporate' 
                                ? 'bg-amba-blue text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setClientType('corporate')}
                          >
                            <Building className="h-6 w-6 mb-1" />
                            Corporate
                          </button>
                          <button
                            type="button"
                            className={`py-2 px-3 rounded-md flex flex-col items-center justify-center text-sm ${
                              clientType === 'group' 
                                ? 'bg-amba-blue text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setClientType('group')}
                          >
                            <Users className="h-6 w-6 mb-1" />
                            Group
                          </button>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <form className="space-y-4">
                        {clientType === 'individual' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  id="firstName"
                                  className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  id="lastName"
                                  className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                id="dob"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                              </label>
                              <select
                                id="gender"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </>
                        )}

                        {clientType === 'corporate' && (
                          <>
                            <div>
                              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                              </label>
                              <input
                                type="text"
                                id="companyName"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700 mb-1">
                                Registration Number
                              </label>
                              <input
                                type="text"
                                id="registrationNo"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                                Industry
                              </label>
                              <select
                                id="industry"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Select Industry</option>
                                <option value="IT">Information Technology</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Retail">Retail</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Employees
                              </label>
                              <input
                                type="number"
                                id="employeeCount"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </>
                        )}

                        {clientType === 'group' && (
                          <>
                            <div>
                              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                                Group Name
                              </label>
                              <input
                                type="text"
                                id="groupName"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 mb-1">
                                Group Type
                              </label>
                              <select
                                id="groupType"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Select Group Type</option>
                                <option value="family">Family</option>
                                <option value="association">Association</option>
                                <option value="trust">Trust</option>
                                <option value="community">Community</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="memberCount" className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Members
                              </label>
                              <input
                                type="number"
                                id="memberCount"
                                className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </>
                        )}

                        {/* Common fields for all client types */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            id="address"
                            rows="2"
                            className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <select
                              id="state"
                              className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="">Select State</option>
                              <option value="AN">Andaman and Nicobar Islands</option>
                              <option value="AP">Andhra Pradesh</option>
                              <option value="AR">Arunachal Pradesh</option>
                              <option value="AS">Assam</option>
                              <option value="BR">Bihar</option>
                              <option value="CH">Chandigarh</option>
                              <option value="CT">Chhattisgarh</option>
                              <option value="DL">Delhi</option>
                              <option value="GA">Goa</option>
                              <option value="GJ">Gujarat</option>
                              <option value="HR">Haryana</option>
                              <option value="HP">Himachal Pradesh</option>
                              <option value="JK">Jammu and Kashmir</option>
                              <option value="JH">Jharkhand</option>
                              <option value="KA">Karnataka</option>
                              <option value="KL">Kerala</option>
                              <option value="MP">Madhya Pradesh</option>
                              <option value="MH">Maharashtra</option>
                              <option value="MN">Manipur</option>
                              <option value="ML">Meghalaya</option>
                              <option value="MZ">Mizoram</option>
                              <option value="NL">Nagaland</option>
                              <option value="OR">Odisha</option>
                              <option value="PB">Punjab</option>
                              <option value="RJ">Rajasthan</option>
                              <option value="SK">Sikkim</option>
                              <option value="TN">Tamil Nadu</option>
                              <option value="TG">Telangana</option>
                              <option value="TR">Tripura</option>
                              <option value="UP">Uttar Pradesh</option>
                              <option value="UK">Uttarakhand</option>
                              <option value="WB">West Bengal</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                              PIN Code
                            </label>
                            <input
                              type="text"
                              id="pincode"
                              className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              id="country"
                              className="shadow-sm focus:ring-amba-blue focus:border-amba-blue block w-full sm:text-sm border-gray-300 rounded-md"
                              defaultValue="India"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amba-blue text-base font-medium text-white hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowAddModal(false);
                    toast.success('Client added successfully');
                  }}
                >
                  Add Client
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
